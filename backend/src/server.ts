import express, { Express, Request, Response } from 'express';
import { google, Auth, calendar_v3 } from 'googleapis';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreStore } from '@google-cloud/connect-firestore';

dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT as string) || 8000;
const isProduction = process.env.NODE_ENV === 'production';

// --- DEPLOYMENT FIX: Explicitly configure Firestore with the Project ID ---
const firestore = new Firestore({
    // This ensures the client connects to the correct database in any environment.
    projectId: process.env.GCP_PROJECT_ID,
});

// Configure CORS
const corsOptions = {
    origin: isProduction ? process.env.FRONTEND_URL : 'https://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

// Configure session management with Firestore
app.use(session({
    store: new FirestoreStore({
        dataset: firestore,
        kind: 'express-sessions', 
    }),
    name: 'calendar-optimizer.sid',
    secret: process.env.SESSION_SECRET || 'super-secret-key-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

app.use(express.json());

// --- Google Calendar API Configuration ---
const GOOGLE_CLIENT_ID: string | undefined = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET: string | undefined = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI: string = isProduction 
    ? `${process.env.BACKEND_URL}/api/google/callback` 
    : 'https://localhost:8000/api/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || (isProduction && !process.env.GCP_PROJECT_ID)) {
    console.error("CRITICAL ERROR: Missing one or more required environment variables.");
    process.exit(1);
}

const oauth2Client: Auth.OAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

// --- Type Interfaces & API Endpoints (remain the same) ---
interface PendingEvent {
    id: number;
    name: string;
    duration: number;
    priority: number;
}

interface ScheduleRequest {
    events: PendingEvent[];
    workDayStart: string;
    workDayEnd: string;
}

app.get('/api/auth', (req: Request, res: Response) => {
    const scopes: string[] = ['https://www.googleapis.com/auth/calendar'];
    const url: string = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', 
        scope: scopes,
    });
    res.redirect(url);
});

app.get('/api/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code as string);
        req.session.credentials = tokens;
        
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).send('Authentication failed during session save.');
            }
            const frontendUrl = isProduction ? process.env.FRONTEND_URL : 'https://localhost:5173';
            res.redirect(`${frontendUrl}/?authenticated=true`);
        });

    } catch (error) {
        console.error('Error authenticating:', error);
        res.status(500).send('Authentication failed');
    }
});

app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('calendar-optimizer.sid');
        console.log('Session destroyed and cookie cleared.');
        res.status(200).json({ message: 'Successfully logged out.' });
    });
});

app.post('/api/generate-schedule', async (req: Request<{}, {}, ScheduleRequest>, res: Response) => {
    if (!req.session.credentials) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }
    
    oauth2Client.setCredentials(req.session.credentials);
    const { events, workDayStart, workDayEnd } = req.body;
    
    try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const calendarEventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: weekFromNow.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const allScheduledEvents = calendarEventsResponse.data.items || [];
        const sortedPendingEvents = events.sort((a, b) => b.priority - a.priority);
        let scheduledCount = 0;

        for (const eventToSchedule of sortedPendingEvents) {
            const { name, duration } = eventToSchedule;
            const availableSlotStart = findNextAvailableSlot(now, allScheduledEvents, duration, workDayStart, workDayEnd);
            const availableSlotEnd = new Date(availableSlotStart.getTime() + duration * 60 * 1000);
            const newEvent: calendar_v3.Schema$Event = {
                summary: name,
                start: { dateTime: availableSlotStart.toISOString(), timeZone: 'America/Los_Angeles' },
                end: { dateTime: availableSlotEnd.toISOString(), timeZone: 'America/Los_Angeles' },
            };
            const createdEvent = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: newEvent,
            });
            allScheduledEvents.push(createdEvent.data);
            allScheduledEvents.sort((a, b) => new Date(a.start!.dateTime!).getTime() - new Date(b.start!.dateTime!).getTime());
            scheduledCount++;
        }

        res.status(200).json({
            message: `Success! ${scheduledCount} events have been added to your calendar.`,
            scheduledCount: scheduledCount,
        });
    } catch (error) {
        console.error('Error generating schedule:', error);
        res.status(500).json({ message: 'Failed to generate schedule' });
    }
});

function findNextAvailableSlot(startTime: Date, existingEvents: calendar_v3.Schema$Event[], durationInMinutes: number, workDayStart: string, workDayEnd: string): Date {
    let proposedTime = new Date(startTime.getTime());
    if (proposedTime < new Date()) { proposedTime = new Date(); }
    
    const [startHour, startMinute] = workDayStart.split(':').map(Number);
    const [endHour, endMinute] = workDayEnd.split(':').map(Number);

    while (true) {
        const minutes = proposedTime.getMinutes();
        const roundedMinutes = Math.ceil(minutes / 15) * 15;
        proposedTime.setMinutes(roundedMinutes, 0, 0);

        const workDayStartTimeOnProposedDay = new Date(proposedTime.getTime());
        workDayStartTimeOnProposedDay.setHours(startHour, startMinute, 0, 0);

        if (proposedTime < workDayStartTimeOnProposedDay) {
            proposedTime = workDayStartTimeOnProposedDay;
        }
        
        const proposedEndTime = new Date(proposedTime.getTime() + durationInMinutes * 60 * 1000);

        const workDayEndTimeOnProposedDay = new Date(proposedTime.getTime());
        workDayEndTimeOnProposedDay.setHours(endHour, endMinute, 0, 0);

        if (proposedEndTime > workDayEndTimeOnProposedDay) {
            const nextDay = new Date(proposedTime.getTime());
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(startHour, startMinute, 0, 0);
            proposedTime = nextDay;
            continue;
        }

        let isSlotFree = true;
        for (const event of existingEvents) {
            if (!event.start?.dateTime || !event.end?.dateTime) continue;
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            if (proposedTime < eventEnd && proposedEndTime > eventStart) {
                isSlotFree = false;
                proposedTime = new Date(eventEnd.getTime());
                break;
            }
        }
        
        if (isSlotFree) {
            return proposedTime;
        }
    }
}

// --- Server Startup Logic ---
if (isProduction) {
    app.listen(port, () => {
        console.log(`✅ Backend server running in production on port ${port}`);
    });
} else {
    const httpsOptions = {
      key: fs.readFileSync(path.resolve(__dirname, '../localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../localhost.pem'))
    };
    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`✅ Backend server running securely at https://localhost:${port}`);
    });
}
