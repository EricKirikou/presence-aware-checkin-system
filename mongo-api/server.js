import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDb } from './db.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Allow all origins (for local dev)
app.use(express.json()); // Parse JSON bodies

// Allow requests from your Vercel frontend
app.use(cors({
  origin: 'https://attendance-six-azure.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true  // Corrected this line
}));


app.use('/api', authRoutes);     // /api/register, /api/login
app.use('/api', healthRoutes);   // /api/health

connectToDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
