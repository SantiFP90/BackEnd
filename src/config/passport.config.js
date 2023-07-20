import passport from "passport";
import local from "passport-local";
import userService from "../../dao/models/Users.model.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          let user = await userService.findOne({ email: username });
          if (user) return done(null, false);
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };
          user = await userService.create(newUser);
          return done(null, user);
        } catch (error) {
          return done({ message: "Error creating user" });
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userService.findOne({ email: username });
          if (!user) return done(null, false, { message: "User not found" });
          if (!isValidPassword(user, password)) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done({ message: "Error logging in" });
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.6cfab1f4d78f2d41",
        clientSecret: "d1df062c45307607bb2875b6ecff2cbeb7f7bdec",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log({ profile });
          let user = await userService.findOne({ email: profile._json.email });
          if (user) return done(null, user);
          const newUser = {
            first_name: profile._json.name,
            last_name: "",
            email: profile._json.email,
            age: 18,
            password: "",
          };
          user = await userService.create(newUser);
          return done(null, user);
        } catch (error) {
          return done({ message: "Error creating user" });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await userService.findOne({ _id });
      return done(null, user);
    } catch {
      return done({ message: "Error deserializing user" });
    }
  });
};

export default initializePassport;
