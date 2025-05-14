
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeDatabase } from './services/supabase.ts'

// Initialize the database when the app starts
initializeDatabase()
  .then(isInitialized => {
    console.log(isInitialized ? 
      'Database initialized successfully' : 
      'Using mock data mode (table does not exist or cannot be accessed)'
    );
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

createRoot(document.getElementById("root")!).render(<App />);
