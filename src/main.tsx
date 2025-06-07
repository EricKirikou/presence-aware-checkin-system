// main.tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Just render the app directly — don't touch backend from here
createRoot(document.getElementById("root")!).render(<App />);
