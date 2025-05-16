
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeDatabase, initializeUsersTable } from './services/supabase.ts'

// Initialize the database tables when the app starts
Promise.all([initializeDatabase(), initializeUsersTable()])
  .then(([attendanceInitialized, usersInitialized]) => {
    console.log(
      attendanceInitialized ? 'Attendance table initialized' : 'Using mock attendance data mode',
      usersInitialized ? 'Users table initialized' : 'Using mock users data mode'
    );
    
    // Render the app after initialization attempts
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    console.log('Will continue to run in mock data mode');
    
    // Render the app even if initialization fails
    createRoot(document.getElementById("root")!).render(<App />);
  });
