import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Root from "./pages/Root"
import About from "./pages/About"
import Home from "./pages/Home"
import Services from "./pages/Services"
import Contact from "./pages/Contact"
import GenerateResume from './pages/GenerateResume.jsx'
import Resume from './pages/Resume.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/*
          The RESUME PREVIEW route MUST NOT be nested inside the Root path
          because it uses an absolute path ("/").
        */}
        <Route path="/resume-preview" element={<Resume />} /> 
        
        {/* All other core routes that use the navigation/footer layout */}
        <Route path='/' element={<Root />}>
          {/* Relative paths for nested routes */}
          <Route path="" element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="generate-resume" element={<GenerateResume />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)