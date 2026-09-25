import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';

import authRoutes from './routes/auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import channelRoutes from './routes/channel.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import ideasRoutes from './routes/ideas.routes.js';
import competitorsRoutes from './routes/competitors.routes.js';
import thumbnailsRoutes from './routes/thumbnails.routes.js';
import scriptRoutes from './routes/script.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

// Session (required only for Passport's internal use during OAuth handshake)
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // false for localhost dev
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CreatorIQ API' }));

// OAuth routes
app.use('/auth', oauthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/thumbnails', thumbnailsRoutes);
app.use('/api/script', scriptRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`✅ CreatorIQ API running at http://localhost:${env.port}`);
  });
}

start();