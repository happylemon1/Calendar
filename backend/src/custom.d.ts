import 'express-session';
import { Auth } from 'googleapis';

declare module 'express-session' {
    interface SessionData {
        credentials?: Auth.Credentials;
    }
}