import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import attendanceRoutes from './routes/attendance.routes'; // adjust path as needed

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/attendance', attendanceRoutes);

// Connect to MongoDB
mongoose.connect('mongodb+srv://erickirikou123:7LNQDoKaOSU9eO9Q@attendance-system.ncm7j2t.mongodb.net/?retryWrites=true&w=majority&appName=attendance-system', {
  // optional: useNewUrlParser: true, useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));
