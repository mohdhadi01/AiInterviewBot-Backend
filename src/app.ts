import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config.js';
import trackRoutes from './routes/track.routes.js';
import focusRoutes from './routes/focus.routes.js';
import userRoutes from './routes/user.routes.js';
import interviewRoutes from './routes/interview.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  if (req.path.startsWith('/api/users')) console.log('[api]', req.method, req.path);
  if (req.path === '/api/chat' || req.path === '/api/analyze') console.log('[api]', req.method, req.path);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/tracks', trackRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/users', userRoutes);
app.use('/api', interviewRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;
