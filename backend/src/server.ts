import express, { Express, Request, Response } from 'express';
import { google, Auth, calendar_v3} from 'googleapis';
import dotenv from 'dotenv';
import https from 'https'; // Import the 'https' module
import fs from 'fs';       // Import the 'fs' module
import path from 'path';   // Import the 'path' module
import cors from 'cors'; 
import session from 'express-session'; 
import { request } from 'http';

// 1. SIMPLIFIED: Load environment variables from the .env file in the backend root
dotenv.config();

const app: Express = express();
const port: number = 8000;

app.use(cors({origin: 'http://localhost:5173', credentials: true}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        secure: true,
        sameSite: 'none',
    }
}))

app.use(express.json());

// --- Google Calendar API Configuration ---
const GOOGLE_CLIENT_ID: string | undefined = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET: string | undefined = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI: string = 'https://localhost:8000/api/google/callback';

// This check remains the same
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("CRITICAL ERROR: Missing Google OAuth credentials. Make sure you have a .env file in the /backend directory with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET variables.");
    process.exit(1);
}

const oauth2Client: Auth.OAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

// --- API Endpoints ---

app.get('/api/auth', (req: Request, res: Response) => {
    const scopes: string[] = ['https://www.googleapis.com/auth/calendar'];
    const url: string = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
});

app.get('/api/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code as string);
        req.session.credentials = tokens; 
        console.log("Successfluly authenticated! Session created.");
        res.redirect('http://localhost:5173/?authenticated=true');
    } catch (error) {
        console.error('Error authenticating:', error);
        res.status(500).send('Authentication failed');
    }
});

// Define a type for our request body
interface PendingEvent { 
    id: number; 
    name: string; 
    duration: number; 
    priority: number; 
}

app.post('/api/generate-schedule', async (req: Request<{}, {}, PendingEvent[]>, res: Response) => {
    if (!req.session.credentials) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    oauth2Client.setCredentials(req.session.credentials); 
    const pendingEvents = req.body; 
    
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

        const sortedPendingEvents = pendingEvents.sort((a, b) => b.priority - a.priority); 

        let scheduledCount = 0; 

        for (const eventToSchedule of sortedPendingEvents) {
            const { name, duration } = eventToSchedule; 

            const availableSlotStart = findNextAvailableSlot(now, allScheduledEvents, duration); 
            const availableSlotEnd = new Date(availableSlotStart.getTime() + duration * 60 * 1000); 

            const newEvent: calendar_v3.Schema$Event = {
                summary: name, 
                start: { dateTime: availableSlotStart.toISOString(), timeZone: 'America/Los_Angeles' }, 
                end: { dateTime: availableSlotEnd.toISOString(), timeZone: 'America/Los_Angeles' },
            };

            const createdEvent = await calendar.events.insert({
                calendarId: 'primary', 
                requestBody: newEvent,
            })

            allScheduledEvents.push(createdEvent.data); 

            allScheduledEvents.sort((a, b) => new Date(a.start!.dateTime!).getTime() - new Date(b.start!.dateTime!).getTime());

            scheduledCount++; 
            console.log(`Event ${name} created successfully.`);
        }

        res.status(200).json({
            message: `Success! ${scheduledCount} events have been added to your calendar.`, 
            scheduledCount: scheduledCount,
        });
    } catch (error) {
        console.error('Error generating schedule:', error);
        res.status(500).json({ message: 'Failed to generate schedule'});
    }
});

function findNextAvailableSlot(startTime: Date, existingEvents: calendar_v3.Schema$Event[], durationInMinutes: number): Date {
    let proposedTime = new Date(startTime.getTime());
    if (proposedTime < new Date()) {
        proposedTime = new Date(); 
    }

    const minutes = proposedTime.getMinutes(); 
    const roundedMinutes = Math.ceil(minutes / 15) * 15; 
    proposedTime.setMinutes(roundedMinutes, 0, 0); 

    while (true) {
        let isSlotFree = true; 
        const proposedEndTime = new Date(proposedTime.getTime() + durationInMinutes * 60 * 1000);
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
        if (isSlotFree) return proposedTime; 
    }
}


// --- HTTPS Server Setup ---

// Define options for the HTTPS server, pointing to your certificate files
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../localhost-key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../localhost.pem'))
};

// Create an HTTPS server and pass the Express app to it
https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`✅ Backend server running securely at https://localhost:${port}`);
});