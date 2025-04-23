import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [duration, setDuration] = useState('')
  const [name, setName] = useState('')
  const [priority,setPriority] = useState('')

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
        </div>
      <div>
        <button
          type = 'submit'
          > Submit your responses
          </button>
      </div>

      </main>
      )
      }
        
        
     

  



 

export default App
