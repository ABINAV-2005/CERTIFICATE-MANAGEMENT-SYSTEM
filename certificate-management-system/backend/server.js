import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import certificateRoutes from './routes/certificates.js';
import templateRoutes from './routes/templates.js';
import verifyRoutes from './routes/verify.js';
import activityRoutes from './routes/activity.js';
import socialRoutes from './routes/social.js';
import { connectDB } from './config/db.js';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production'
    ? (Number(process.env.API_RATE_LIMIT_MAX) || 1200)
    : (Number(process.env.API_RATE_LIMIT_MAX) || 10000),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait and try again.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/social', socialRoutes);

app.get('/api/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    status: 'ok',
    database: dbStates[state] || 'unknown',
    dbName: mongoose.connection.name || null,
    timestamp: new Date().toISOString()
  });
});

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then((connection) => {
    console.log(`MongoDB connected (${connection.name || 'unknown-db'})`);
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});

app.set('io', io);

const PORT = Number(process.env.PORT) || 5005;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
