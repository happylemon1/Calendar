import React, { Component } from 'react';
import './App.css';

// --- Define Types and Interfaces ---
interface PendingEvent {
  id: number;
  name: string;
  duration: number;
  priority: number;
}

interface AppState {
  isAuthenticated: boolean;
  eventName: string;
  priority: string;
  duration: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  pendingEvents: PendingEvent[];
  message: string;
}

class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: false,
      eventName: '',
      priority: '',
      duration: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      pendingEvents: [],
      message: '',
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
      this.setState({ isAuthenticated: true });
      localStorage.setItem('isAuthenticated', 'true');

      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedAuthStatus = localStorage.getItem('isAuthenticated');
      if (savedAuthStatus === 'true') {
        this.setState({ isAuthenticated: true });
      }
    }

    const savedPendingEvents = localStorage.getItem('pendingEvents');
    if (savedPendingEvents) {
      this.setState({ pendingEvents: JSON.parse(savedPendingEvents) });
    }
  }

  componentDidUpdate(prevProps: {}, prevState: AppState) {
    if (prevState.pendingEvents !== this.state.pendingEvents) {
      localStorage.setItem('pendingEvents', JSON.stringify(this.state.pendingEvents));
    }
  }

  handleSignIn = () => {
    window.location.href = 'https://localhost:8000/api/auth';
  };

  handleLogout = async (logoutMessage: string = 'You have been logged out.') => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('pendingEvents');
    this.setState({ 
      isAuthenticated: false, 
      pendingEvents: [],
      message: logoutMessage 
    });

    try {
      await fetch('https://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Error during server logout:", error);
    }
  };
  
  handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { eventName, duration, priority, pendingEvents } = this.state;

    if (!eventName || !duration || !priority || Number(duration) <= 0) {
      this.setState({ message: "Please fill out all event fields with a valid duration." });
      return;
    }

    const newEvent: PendingEvent = {
      id: Date.now(),
      name: eventName,
      duration: Number(duration),
      priority: Number(priority),
    };

    this.setState({
      pendingEvents: [...pendingEvents, newEvent],
      eventName: '',
      duration: '',
      priority: '',
      message: `'${newEvent.name}' has been added to the queue.`
    });
  };

  handleGenerateSchedule = async () => {
    this.setState({ message: 'Generating schedule for all events...' });

    try {
      const response = await fetch('https://localhost:8000/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: this.state.pendingEvents,
          workDayStart: this.state.workingHoursStart,
          workDayEnd: this.state.workingHoursEnd,
        }),
        credentials: 'include',
      });

      if (response.status === 401) {
        this.handleLogout('Your session has expired. Please sign in again.');
        return; 
      }

      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'An unknown error occurred.'); }

      this.setState({
        pendingEvents: [],
        message: `Success! ${data.scheduledCount} events have been added to your calendar.`,
      });

    } catch (error) {
      if (error instanceof Error) {
        this.setState({ message: `Error: ${error.message}` });
      }
    }
  };

  render() {
    const { isAuthenticated, eventName, duration, priority, pendingEvents, message, workingHoursStart, workingHoursEnd } = this.state;

    return (
      <main className="container">
        <div className="header-bar">
            <h1>Greedy Calendar Optimizer</h1>
            {isAuthenticated && (
                <button onClick={() => this.handleLogout()} className="logout-button">Logout</button>
            )}
        </div>
        
        {!isAuthenticated ? (
          <div className="card">
            <h2>1. Sign In</h2>
            <p>
              Begin by signing in with your Google Account. This allows the application
              to securely access your calendar and find available time slots.
            </p>
            <button onClick={this.handleSignIn}>Sign in with Google</button>
          </div>
        ) : (
          <>
            <div className="card">
                <h2>Scheduling Constraints</h2>
                <div className="constraints-grid">
                    <div className="form-group">
                        <label htmlFor="workDayStart">Work Day Start Time:</label>
                        <input 
                            id="workDayStart"
                            type="time"
                            value={workingHoursStart}
                            onChange={(e) => this.setState({ workingHoursStart: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="workDayEnd">Work Day End Time:</label>
                        <input 
                            id="workDayEnd"
                            type="time"
                            value={workingHoursEnd}
                            onChange={(e) => this.setState({ workingHoursEnd: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
              <h2>Add Events to Schedule</h2>
              <form onSubmit={this.handleAddEvent}>
                <div className="form-group">
                  <label htmlFor="eventName">Event Name:</label>
                  <input id="eventName" type="text" value={eventName} onChange={(e) => this.setState({ eventName: e.target.value })} placeholder="e.g., Study for exam" required />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (in minutes):</label>
                  <input 
                    id="duration" 
                    type="number" 
                    value={duration} 
                    onChange={(e) => this.setState({ duration: e.target.value })} 
                    placeholder="e.g., 40"
                    min="1"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority Level:</label>
                  <select id="priority" value={priority} onChange={(e) => this.setState({ priority: e.target.value })} required>
                    <option value="" disabled>Select a priority...</option>
                    <option value="5">5 (Highest)</option>
                    <option value="4">4</option>
                    <option value="3">3 (Medium)</option>
                    <option value="2">2</option>
                    <option value="1">1 (Lowest)</option>
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
          </>
        )}
        {message && (
          <div className="card message-box">
            <h3>Status</h3>
            <p>{message}</p>
          </div>
        )}
      </main>
    );
  }
}

export default App;