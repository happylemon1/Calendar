import express, { Express, Request, Response } from 'express';
import { google, Auth, calendar_v3 } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

// 1. Load environment variables
dotenv.config();

const app: Express = express();
const port = parseInt(process.env.PORT || '8000', 10);

// 2. Base URLs from environment
type Env = 'development' | 'production';
const NODE_ENV = (process.env.NODE_ENV as Env) || 'development';
const BACKEND_URL = process.env.BACKEND_URL!;    // e.g. https://your-cloud-run-url
const FRONTEND_URL = process.env.FRONTEND_URL!;  // e.g. https://your-frontend-url

// 3. CORS setup
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// 4. Session config
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        sameSite: 'none',
    }
}));

app.use(express.json());

// 5. OAuth2 client setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${BACKEND_URL}/api/google/callback`;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BACKEND_URL || !FRONTEND_URL) {
    console.error('ERROR: Missing required environment variables.');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

// 6. Auth endpoint
type AuthCodeRequest = Request<{}, {}, {}>;
app.get('/api/auth', (req: AuthCodeRequest, res: Response) => {
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
});

// 7. OAuth callback
app.get('/api/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        req.session.credentials = tokens;
        console.log('🎫 Saved session credentials:', Object.keys(tokens));
        res.redirect(`${FRONTEND_URL}/?authenticated=true`);
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        res.status(500).send('Authentication failed');
    }
});

// 8. Schedule generation endpoint
type PendingEvent = { id: number; name: string; duration: number; priority: number; };
app.post('/api/generate-schedule', async (req: Request<{}, {}, PendingEvent[]>, res: Response) => {
    console.log('🔒 Session creds present?', !!req.session.credentials);
    if (!req.session.credentials) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    oauth2Client.setCredentials(req.session.credentials);
    const pendingEvents = req.body;

    try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // events.list with retry
        let listResp;
        for (let attempt = 1; ; attempt++) {
            try {
                listResp = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin: now.toISOString(),
                    timeMax: weekFromNow.toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                break;
            } catch (err: any) {
                console.error(`events.list attempt ${attempt} error:`, err.response?.data || err);
                if (attempt >= 5 || err.code !== 503) throw err;
                await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 200));
            }
        }

        const scheduled: calendar_v3.Schema$Event[] = listResp.data.items || [];
        const sortedPending = pendingEvents.sort((a, b) => b.priority - a.priority);
        let count = 0;

        for (const evt of sortedPending) {
            const startSlot = findNextAvailableSlot(new Date(), scheduled, evt.duration);
            const endSlot = new Date(startSlot.getTime() + evt.duration * 60 * 1000);
            const newEvt: calendar_v3.Schema$Event = {
                summary: evt.name,
                start: { dateTime: startSlot.toISOString(), timeZone: 'America/Los_Angeles' },
                end: { dateTime: endSlot.toISOString(), timeZone: 'America/Los_Angeles' },
            };

            for (let attempt = 1; ; attempt++) {
                try {
                    const created = await calendar.events.insert({ calendarId: 'primary', requestBody: newEvt });
                    console.log(`✅ Created ${evt.name}:`, created.data.id);
                    scheduled.push(created.data);
                    count++;
                    break;
                } catch (err: any) {
                    console.error(`insert ${evt.name} attempt ${attempt} error:`, err.response?.data || err);
                    if (attempt >= 5 || err.code !== 503) break;
                    await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 200));
                }
            }
        }

        res.json({ message: `Added ${count} events.`, scheduledCount: count });
    } catch (err) {
        console.error('Generate-schedule fatal error:', err);
        res.status(500).json({ message: 'Failed to generate schedule' });
    }
});

// 9. Helper for finding open slots
function findNextAvailableSlot(startTime: Date, existing: calendar_v3.Schema$Event[], durationMin: number): Date {
    let slot = new Date(startTime);
    const round = Math.ceil(slot.getMinutes() / 15) * 15;
    slot.setMinutes(round, 0, 0);
    while (true) {
        const end = new Date(slot.getTime() + durationMin * 60 * 1000);
        if (!existing.some(e => {
            if (!e.start?.dateTime || !e.end?.dateTime) return false;
            const s = new Date(e.start.dateTime), e1 = new Date(e.end.dateTime);
            return slot < e1 && end > s;
        })) return slot;
        const nextEnd = new Date(existing[0].end!.dateTime!);
        slot = new Date(nextEnd.getTime() + 15 * 60 * 1000);
    }
}

// 10. HTTP server launch (Cloud Run handles TLS)
app.listen(port, () => {
    console.log(`🚀 Server listening on ${BACKEND_URL}`);
});
