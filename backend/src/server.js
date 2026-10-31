import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import announcementRoutes from './routes/announcements.routes.js';
import activityRoutes from './routes/activities.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. TRUST RENDER'S PROXY (Fixes the rate-limit crash)
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/activities', activityRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 2. START THE SERVER FIRST (Prevents Render from timing out)
app.listen(PORT, () => {
  console.log(`🚀 API on http://localhost:${PORT}`);
  
  // 3. CONNECT TO DATABASE IN BACKGROUND
  connectDB().catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
});
