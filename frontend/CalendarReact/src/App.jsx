import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const[loggedIn, setLoggedIn] = useState(false);
  const [duration, setDuration] = useState('')
  const [name, setName] = useState('')
  const [priority,setPriority] = useState('')
  // for now I'm just going to use the empty array as a placeholder
  //until we decide how we want to store it
  const [schedule,setSchedule] = useState([])

  // TLDR; need to adjust frontend as well to check login status somehow. 
  /*
  useEffect(() => {
    fetch('http://localhost:8000/status', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setLoggedIn(data.logged_in))
      .catch(err => console.error('Status fetch failed:', err));
  }, []);
  */
  
  const addEvent = () => {
    const data = {
      name: name,
      duration: Number(duration),
      priority: Number(priority)
    }
    fetch('http://localhost:8000/submitEvent', {
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
    fetch('http://localhost:8000/generateSchedule',{
      method:'GET'})
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

  return (
    <main>
      <div id = 'user_Inputs'>
      <h1> Schedule Optimizer</h1>
      <div>

      <div>
        <button
          className="user_auth"
          onClick={() => window.location.href = 'http://localhost:8000/authorize'}
        >
          Sign in with Google
        </button>
      </div>
      <input
        type="text"
        placeholder="Name of the event"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      </div>

      <div>
      <input 
        type = 'number'
        placeholder = 'Expected Duration'
        value = {duration}
        onChange = {(e) => setDuration(e.target.value)} 
        />
        </div>

      <div>
      <input
        type = 'number'
        placeholder = 'Event Priority (1-5)'
        value = {priority}
        onChange = {(e) => setPriority(e.target.value)}
        />
        </div>
        <div>
          <button
          type = 'button'
          onClick = {addEvent}
          > Add Event
          </button>
        </div>
        </div>
      <div>
        <button
          type = 'button'
          onClick={generateSchedule}
          > Submit your responses
          </button>  
      </div>
      
      </main>
        )
      }

export default App
