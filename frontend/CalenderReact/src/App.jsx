import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [duration, setDuration] = useState('')
  const [name, setName] = useState('')
  const [priority,setPriority] = useState('')
  
  const addEvent = () => {
    const data = {
      name: name,
      duration: Number(duration),
      priority: Number(priority)
    }
    fetch('http://localhost:5000/submitEvent', {
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
  }

  return (
    <main>
      <div id = 'user_Inputs'>
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
