import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import errorLogger from './utils/errorLogger.js'

// Make errorLogger globally available for debugging
window.errorLogger = errorLogger;
console.log('✅ errorLogger is now available globally. Use errorLogger.downloadLogs() to export errors.');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
