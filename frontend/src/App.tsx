import React, { Component } from 'react';
import './App.css';

// --- PRODUCTION BACKEND URL ---
const API_BASE_URL = "https://calendar-optimizer-backend-688154466351.us-central1.run.app";

// --- Types and Interfaces ---

type AppState = {
  isAuthenticated: boolean,
  eventName: string,
  priority: string,
  duration: string,
  pendingEvents: PendingEvent[],
  message: string,
  lastScheduledEvent: ScheduledEvent | null,
}

type ScheduledEvent = {
  name: string,
  startTime: string,
}

interface PendingEvent {
  id: number;
  name: string;
  duration: number;
  priority: number;
}

// --- The Class Component ---
class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: false,
      eventName: '',
      priority: '',
      duration: '',
      pendingEvents: [],
      message: '',
      lastScheduledEvent: null,
    };
  }

  componentDidMount() {
    // Check the page's URL for our ?authenticated=true flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
      this.setState({ isAuthenticated: true });
    }
  }

  handleSignIn = () => {
    window.location.href = `${API_BASE_URL}/api/auth`;
  };

  handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { eventName, duration, priority, pendingEvents } = this.state;
    if (!eventName || !duration || !priority || Number(duration) <= 0) {
      this.setState({ message: "Please fill out all event fields and input valid values." })
      return;
    }

    const newEvent: PendingEvent = {
      id: Date.now(),
      name: eventName,
      duration: Number(duration),
      priority: Number(priority),
    }

    this.setState({
      pendingEvents: [...pendingEvents, newEvent],
      eventName: '',
      duration: '',
      priority: '',
      message: `${newEvent.name} has been added to the queue.`
    })
  }

  handleGenerateSchedule = async () => {
    this.setState({ message: 'Generating schedule for all events...', lastScheduledEvent: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.pendingEvents),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      this.setState({
        pendingEvents: [],
        message: `Success! ${data.scheduledCount} events have been added to your calendar.`,
        lastScheduledEvent: null,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.setState({ message: `Error: ${error.message}` });
      }
    }
  };

  render() {
    const { isAuthenticated, eventName, duration, priority, pendingEvents, message } = this.state;

    return (
      <main className="container">
        <h1> Calendar Optimizer </h1>

        {!isAuthenticated ? (
          <div className="card">
            <h2>1. Sign In </h2>
            <p>
              Begin by signing in with your Google Account to allow the application to
              securely access your calendar and find available time slots.
            </p>
            <button onClick={this.handleSignIn}>Sign in with Google</button>
          </div>
        ) : (
          <>

            <div className="card">
              <h2>Add Events to Schedule</h2>
              <form onSubmit={this.handleAddEvent}>
                <div className="form-group">
                  <label htmlFor="eventName"> Event Name: </label>
                  <input
                    id="eventName"
                    type="text"
                    value={eventName}
                    onChange={(e) => this.setState({ eventName: e.target.value })}
                    placeholder="e.g., Study for exam"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (in minutes):</label>
                  <input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => this.setState({ duration: e.target.value })}
                    placeholder="e.g. 30"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority Level:</label>
                  <select id="priority" value={priority} onChange={(e) => this.setState({ priority: e.target.value })} required>
                    <option value="" disabled>Select a priority...</option>
                    <option value="5">5 (Highest) </option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <button type="submit">Add Event to Queue</button>
              </form>
            </div>

            <div className="card">
              <h2>Pending Events Queue</h2>
              {pendingEvents.length === 0 ? (
                <p>No events have been added yet.</p>
              ) : (
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Duration</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEvents.map(event => (
                      <tr key={event.id}>
                        <td>{event.name}</td>
                        <td>{event.duration} mins</td>
                        <td>{event.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {pendingEvents.length > 0 && (
                <button className="generate-button" onClick={this.handleGenerateSchedule}>
                  Generate Schedule for {pendingEvents.length} Events
                </button>
              )}
            </div>

            {message && (
              <div className="card message-box">
                <h3>Status</h3>
                <p>{message}</p>
              </div>
            )}
          </>
        )}
      </main>
    )
  }
}

export default App;
