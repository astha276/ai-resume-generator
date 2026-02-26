import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'  // ✅ Import the REAL App from App.jsx
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />  {/* ✅ This renders your routing App with all the pages */}
  </StrictMode>
)