import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </HelmetProvider>
  </React.StrictMode>,
)
