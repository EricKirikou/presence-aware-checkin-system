import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDb } from './db.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS properly
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend origin
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

app.use('/api', authRoutes);     // /api/register, /api/login
app.use('/api', healthRoutes);   // /api/health

connectToDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
