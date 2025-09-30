
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { router as authRouter } from './routes/auth.routes.js';
import { router as adRouter } from './routes/ad.routes.js';
import { router as wasteRouter } from './routes/waste.routes.js';
import { router as pointsRouter } from './routes/points.routes.js';
import { router as couponRouter } from './routes/coupon.routes.js';

import { errorHandler } from './utils/error.js';

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Idempotency-Key','X-Client-Id','X-Device-Id','X-Signature','X-Nonce','X-Timestamp']
}));

app.use(express.json({ limit: '200kb' }));
app.use(hpp());
app.use(morgan(process.env.LOG_LEVEL || 'combined'));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/ads', adRouter);
app.use('/api/waste', wasteRouter);
app.use('/api/points', pointsRouter);
app.use('/api/coupons', couponRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`API on :${PORT}`));
}
start().catch(err => {
  console.error('Startup error', err);
  process.exit(1);
});
