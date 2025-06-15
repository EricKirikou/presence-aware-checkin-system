import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = getDb();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Auto-generate username
    const username = 'user_' + Date.now();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: 'user', // Default role (optional)
    };

    await db.collection('users').insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully.', user: { email: newUser.email, username: newUser.username } });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ email });

    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

export default router;
