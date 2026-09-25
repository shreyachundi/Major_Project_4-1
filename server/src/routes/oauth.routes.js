import { Router } from 'express';
import passport from 'passport';
import { signToken } from '../utils/jwt.js';
import { publicUser } from '../services/auth.service.js';
import { env } from '../config/env.js';

const router = Router();

// Step 1: Redirect user to Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Step 2: Google redirects back here
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.clientOrigin}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      const user = req.user;
      // Create our app JWT
      const token = signToken({ id: user._id.toString(), email: user.email });
      // Redirect to frontend with token in URL
      res.redirect(`${env.clientOrigin}/auth/callback?token=${token}`);
    } catch (err) {
      res.redirect(`${env.clientOrigin}/login?error=token_failed`);
    }
  }
);

export default router;