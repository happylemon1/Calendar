import { useState } from 'react'
import SignInButton from './components/signInButton.jsx';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const checkAuthAndMaybeRedirect = () => {
  fetch('https://localhost:8000/quickStartCall')
    .then(res => res.json())
    .then(json => {
      setLoggedIn(json.authenticated)
      if (!loggedIn) {
        // not signed in → OAuth dance
        window.location = 'https://localhost:8000/apiAuth';
      } else {
        // already signed in → show events
        setAuth(true);
      }
    });
};



function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [duration, setDuration] = useState('')
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('')
  // for now I'm just going to use the empty array as a placeholder
  //until we decide how we want to store it
  const [schedule, setSchedule] = useState([])

  // handleLogin for the google logIn shit.
  const handleLogin = async accessToken => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken })
    })
    const data = await res.json()
    setCalData(data)
  }
  const addEvent = () => {
    const data = {
      name: name,
      duration: Number(duration),
      priority: Number(priority)
    }

    // push onto local stack
    setSchedule(prev => [data, ...prev])

    fetch('https://localhost:8000/submitEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error('Add event failed:', err));

    // Optional: Clear the form
    setName('');
    setDuration('');
    setPriority('');
  }

  const generateSchedule = () => {
    fetch('https://localhost:8000/generateSchedule', {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((data) => {
        // we gotta make a shit ton of edits to display the data we actualyl want to
        // this is just a placeholder
        setSchedule(data);
      })
      .catch((error) => {
        console.error('Error fetching schedule:', error);
      });
  };

  if (!loggedIn) {
    return (
      <div>
        <button
          className="user_auth"
          onClick={checkAuthAndMaybeRedirect}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  if (loggedIn) {
    return (
      <main>
        <div id='user_Inputs'>
          <h1> Schedule Optimizer</h1>
          <div>


            <input
              type="text"
              placeholder="Name of the event"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <input
              type='number'
              placeholder='Expected Duration'
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <input
              type='number'
              placeholder='Event Priority (1-5)'
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          </div>
          <div>
            <button
              type='button'
              onClick={addEvent}
            > Add Event
            </button>
          </div>
        </div>
        <div>
          <button
            type='button'
            onClick={generateSchedule}
          > Generate Schedule
          </button>
        </div>

        {/* render the stack of events */}
        <section id="event-stack">
          {schedule.length === 0 ? (
            <p><em>No events in stack yet. Add one!</em></p>
          ) : (
            <table className="event-stack">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Duration</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((evt, idx) => (
                  <tr key={idx}>
                    <td>{evt.name}</td>
                    <td>{evt.duration}</td>
                    <td>{evt.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    )
  }

}

export default App
