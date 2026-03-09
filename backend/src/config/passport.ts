import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../models/User';

export const configureGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value;
          
          if (email) {
            user = await User.findOne({ email });
            
            if (user) {
              user.googleId = profile.id;
              user.picture = profile.photos?.[0]?.value;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              email: email || `user_${profile.id}@google.local`,
              name: profile.displayName,
              googleId: profile.id,
              picture: profile.photos?.[0]?.value,
              subscription: {
                plan: 'free',
                credits: 100
              }
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  );
};

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
