require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");


mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/b+", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60
    })
  })
);


//============================
//============================
//============================


// const GoogleStrategy = require('passport-google').Strategy;
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
// const flash = require("connect-flash")
// app.use(flash())


const GithubStrategy = require("passport-github").Strategy;

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://herokuapp.be-positive-thi-moritz/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // find a user with profile.id as githubId or create one
    User.findOne({
      githubId: profile.id
    }).then(daUser => {
      if (daUser) {
        //There is user with that ID
        done(null, daUser)
      } else {
        //No user
        User.create({
          githubId: profile.id
        }).then(dbUser => {
          done(null, dbUser)
        }).catch(err => {
          done(err)
        })
      }
    })
    console.log(profile);
  }
))


const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://herokuapp.be-positive-thi-moritz/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
          googleId: profile.id
        })
        .then(found => {
          if (found !== null) {
            // user with that googleId already exists
            done(null, found);
          } else {
            // no user with that googleId
            return User.create({
              googleId: profile.id
            }).then(dbUser => {
              done(null, dbUser);
            });
          }
        })
        .catch(err => {
          done(err);
        });
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());
//============================
//============================
//============================

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

const partialsPath = path.join(__dirname, "./views/partials");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));


hbs.registerPartials(partialsPath)
// default value for title local
app.locals.title = "b+";

const index = require("./routes/index");
app.use("/", index);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);


const profile = require("./routes/profile")
app.use("/", profile)



module.exports = app;