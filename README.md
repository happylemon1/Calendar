# Calendar Optimizer 🗓️✨

A full-stack web application that automatically finds free time in your Google Calendar and schedules a list of tasks for you. Simply provide a list of tasks with their duration and priority, and let this tool intelligently place them in the next available slots, starting with your highest priority items first.

***

## Features

-   **Secure Google Authentication**: Uses the official Google OAuth 2.0 flow to securely access your calendar data. Credentials are never stored long-term.
-   **Dynamic Event Queue**: Add multiple events with custom names, durations (in minutes), and priority levels (1-5).
-   **Intelligent Scheduling**: The backend algorithm fetches your existing calendar events for the next 7 days to identify free time slots.
-   **Priority-First Algorithm**: Events you mark with a higher priority are scheduled first, ensuring your most important tasks get a spot.
-   **Automatic Scheduling**: With a single click, all pending events are processed and added to your primary Google Calendar.
-   **Clear User Feedback**: The interface provides real-time status updates, from adding an event to the queue to confirming the final schedule generation.

***

## Tech Stack

This project is built with a modern, type-safe stack:

-   **Frontend**:
    -   [React](https://reactjs.org/) (as a Class Component)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   Standard CSS for styling
-   **Backend**:
    -   [Node.js](https://nodejs.org/)
    -   [Express.js](https://expressjs.com/)
    -   [TypeScript](https://www.typescriptlang.org/)
-   **Google Integration**:
    -   [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
    -   Google Calendar API v3
    -   Google OAuth 2.0
-   **Session Management**:
    -   [express-session](https://github.com/expressjs/session) for managing user authentication state.

***

## How It Works

The application follows a simple, user-friendly flow:

1.  **Authentication**: The user clicks "Sign in with Google", which redirects them to the backend's `/api/auth` endpoint. This generates a Google consent screen URL.
2.  **Authorization**: After the user grants permission, Google redirects back to the backend's `/api/google/callback` URI with an authorization code.
3.  **Token Exchange**: The backend exchanges the code for access and refresh tokens. These tokens are stored securely in the user's server-side session. The user is then redirected back to the frontend with an `authenticated=true` flag in the URL.
4.  **Add Events**: The user can now access the main application. They add tasks by specifying a name, duration, and priority. These are added to a "Pending Events Queue" in the React component's state.
5.  **Generate Schedule**: The user clicks the "Generate Schedule" button. The frontend sends the entire queue of pending events to the backend's `/api/generate-schedule` endpoint.
6.  **Find & Create Events**: The backend performs the core logic:
    - It authenticates with the Google Calendar API using the tokens stored in the session.
    - It fetches all existing events in the user's primary calendar for the upcoming week.
    - It sorts the user's pending events by priority (highest first).
    - It iterates through the sorted list, and for each event, it calls the `findNextAvailableSlot` helper function to find the earliest open time that fits the event's duration.
    - It creates the event in the user's calendar via an API call.
7.  **Confirmation**: The backend sends a success response to the frontend, which displays a final confirmation message to the user.

***

## Local Setup & Installation

To run this project locally, you will need to set up both the backend server and the frontend client.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v16 or higher)
-   `npm` or `yarn`
-   A Google Account

### 1. Configure Google Cloud Console

You must create Google API credentials for the application to work.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  In the sidebar, navigate to **APIs & Services** -> **Enabled APIs & services**. Click **+ ENABLE APIS AND SERVICES** and enable the **Google Calendar API**.
4.  Go to **APIs & Services** -> **Credentials**.
5.  Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
6.  Choose **Web application** as the application type.
7.  Under **Authorized JavaScript origins**, add `http://localhost:3000`.
8.  Under **Authorized redirect URIs**, add `http://localhost:8000/api/google/callback`.
9.  Click **Create**. Copy the **Client ID** and **Client Secret** for the next step.

### 2. Backend Setup

The backend server handles authentication and communication with the Google Calendar API.

```bash
# Navigate to your backend directory
cd path/to/backend

# Install dependencies
npm install

# Create a .env file in the root of the backend directory
touch .env
```

Open the `.env` file and add the following variables, replacing the placeholder values with your own:

```ini
# .env file

# Google OAuth Credentials from Step 1
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Application URLs for local development
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# A random string for securing sessions
SESSION_SECRET=this_is_a_super_secret_string_change_me

# Set the environment to development
NODE_ENV=development
```

Finally, start the backend server:

```bash
npm run start # Or your configured start script
```

The server should now be running at `http://localhost:8000`.

### 3. Frontend Setup

The frontend is a React application that provides the user interface.

```bash
# Navigate to your frontend directory
cd path/to/frontend

# Install dependencies
npm install
```

**Important**: The `API_BASE_URL` in `src/App.tsx` is hardcoded for production. For local development, you must change it to point to your local backend server.

Open `src/App.tsx` and modify the constant:

```typescript
// --- DEVELOPMENT BACKEND URL ---
const API_BASE_URL = "http://localhost:8000";

// --- PRODUCTION BACKEND URL ---
// const API_BASE_URL = "[https://calendar-optimizer-backend-688154466351.us-central1.run.app](https://calendar-optimizer-backend-688154466351.us-central1.run.app)";
```

Now, you can start the frontend React app:

```bash
npm start
```

Your browser should open to `http://localhost:3000`, and you can begin using the application!