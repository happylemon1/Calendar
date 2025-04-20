import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [preReg, setPreReg] = useState('No')
  const [Duration, setDuration] = useState(0)
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [priority,setPriority] = useState('')
  const [weekDay, setWeekDay] = useState('')

  const checkIfRegistered = () => {
    let EventData = {Name: name}
  
    if (preReg.toLowerCase() === 'Yes') {
      EventData.Start = start
      EventData.WeekDay = weekDay
      EventData.End = end
    }
    else {
      EventData.Duration = Duration
      EventData.Priority = Priority
    }
  }

  return (
    <main>
    <h1> Schedule Optimizer</h1>
      <input
        type = 'submit'
        placeholder='Is this a pre-scheduled event? (Yes/No)'
        value = {preReg}
        setValue = {(e) => setPreReg(e.target.value)}
        ></input>

        <button>
          type = 'submit'
          onclick = {checkIfRegistered}
        </button>
        </main>
        
  )



 }

export default App
