import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { findOrCreateGoogleUser } from '../services/auth.service.js';

export function configurePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: 'http://localhost:4000/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), null);

          const user = await findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName,
          });

          user._accessToken = accessToken;
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const { User } = await import('../models/User.js');
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}