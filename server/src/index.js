import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import channelRoutes from './routes/channel.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import ideasRoutes from './routes/ideas.routes.js';
import competitorsRoutes from './routes/competitors.routes.js';
import thumbnailsRoutes from './routes/thumbnails.routes.js';
import aiRoutes from './routes/ai.routes.js';
import chatRoutes from './routes/chat.routes.js';
import scriptRoutes from './routes/script.routes.js';

const app = express();
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CreatorIQ API' }));

app.use('/api/auth', authRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/thumbnails', thumbnailsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/script', scriptRoutes);

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`✅ CreatorIQ API running at http://localhost:${env.port}`);
  });
}

start();