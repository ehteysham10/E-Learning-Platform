import dotenv from "dotenv";
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },

  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos[0]?.value || "";

      // 1️⃣ Check existing googleId
      let user = await User.findOne({ googleId });

      if (user) {
        user.emailVerified = true;
        await user.save();
        return done(null, user);
      }

      // 2️⃣ Check existing email
      user = await User.findOne({ email });

      if (user) {
        user.googleId = googleId;
        user.avatar = avatar;
        user.isGoogleAccount = true;   
        user.emailVerified = true;
        await user.save();
        return done(null, user);
      }

      // 3️⃣ New user
      user = new User({
        name,
        email,
        googleId,
        avatar,
        emailVerified: true,  // important
         isGoogleAccount: true,
        role: "student",
      });

      await user.save();
      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }
));

export default passport;
