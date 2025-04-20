import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [preReg, setPreReg] = useState('No')
  const [duration, setDuration] = useState(0)
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [priority,setPriority] = useState('')
  const [weekDay, setWeekDay] = useState('')

  const [preRegFields, setPreRegFields] = useState(false)
  const[eventFields,setEventFields] = useState(false)

  const handlePreRegChange = () => {
    if (preReg.toLocaleLowerCase() === 'yes'){
      setPreRegFields(true)
      setEventFields(false)
    } else {
      setPreRegFields(false)
      setEventFields(true)
    }
  }

  return (
    <main>
      <h1> Schedule Optimizer</h1>
      <input
        type="text"
        placeholder="Is this a pre-scheduled event? (Yes/No)"
        value={preReg}
        onChange={(e) => setPreReg(e.target.value)}
      />

        <button
          type = 'submit'
          onclick = {handlePreRegChange}
        > Add </button>

        {preRegFields && (
          <div>
            <h2> PreScheduled Event Details</h2>
            <input
            type = 'submit'
            placeholder = 'Duration of Event'
            value = {duration}
            onChange = {(e) => setDuration(e.target.value)}>
            </input>
           
            <input
            type = 'number'
            placeholder = 'Enter Priority (Highest 5, lowest 1)'
            value = {priority}
            onChange = {(e) => setPriority(e.target.value)}>
            </input>
          </div>
        )}

        {eventFields && (
          <div>
            <input
            type = 'time'
            placeholder = 'start Time'
            value = {start}
            onChange = {(e) => setStart(e.target.value)}>
            </input>

            <input
            type = 'time'
            placeholder = 'End time'
            value = {end}
            onChange = {(e) => setEnd(e.target.value)}>
            </input>

            <input
            type = 'text'
            placeholder = 'Weekday'
            value = {weekDay}
            onChange = {(e) => setWeekDay(e.target.value)}>
            </input>

          </div>


        )}
        </main>
     

  )



 }

export default App
