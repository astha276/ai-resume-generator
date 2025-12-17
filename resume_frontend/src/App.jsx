import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-5xl text-gray-700 font-bold p-10">Welcome to resume app</h1>
    </>
  )
}

export default App
