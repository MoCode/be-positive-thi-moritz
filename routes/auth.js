const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
//==========================================MONGOOSE
const User = require("../models/User");
const Challenge = require("../models/Challenges");
const _ = require('lodash')


//============================== RENDER THE ROUTES (HBS DATAS)


// write the get /signup route to show a form
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login");
});

//==========================================


router.post("/signup", (req, res, next) => {
  console.log(req.body);
  const username = req.body.username; //GETTING THE DATA FROM THE FORM
  const password = req.body.password;
  // const { username, password } = req.body;



  //=================================== ERROR MESSAGES FOR SIGN IN
  // check if the password is long enough and username is not empty
  if (password.length < 8) {
    res.render("signup", {
      message: "Your password must be 8 char. min."
    });
    return;
  }
  if (username === "") {
    res.render("signup", {
      message: "Your name cannot be empty"
    });
    return;
  }


  //=================================== DOES USERNAME EXIST??
  User.findOne({ //CONNECTION TO SCHEMA WE HAVE DONE!!!!
    username
  }).then(found => {
    if (found !== null) {
      res.render("signup", {
        message: "This username is already taken"
      });
    } else {
      // we can create a user with the username and password pair
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);

      Challenge.find().then((allChallenges) => {
        let randomChallenge = _.sample(allChallenges)
        //SENDING DATA TO THE DB!!!!
        User.create({
            username: username,
            password: hash,
            level: 0,
            currentChallenge: randomChallenge
          })
          .then(dbUser => {
            req.session.user = dbUser;
            res.redirect("/private");
          })
          .catch(err => {
            next(err);
          });
      })

    }
  });
});



//==========================================


router.post("/login", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    username: username
  }).then(found => {
    if (found === null) {
      // no user in the collection has this username
      res.render("login", {
        message: "Invalid credentials"
      });
      return;
    }
    if (bcrypt.compareSync(password, found.password)) {
      // password and hash match


      // __________GET CHALLENGE PER USER
      Challenge.find().then(listOfChallenges => {
        const randIndex = Math.floor(Math.random() * listOfChallenges.length)
        const randChallengeId = listOfChallenges[randIndex]
        found.currentChallenge = randChallengeId
        req.session.user = found;
        res.redirect("/private");
      })
    } else {
      res.render("login", {
        message: "Invalid credentials"
      });
    }
  });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    else res.redirect("/");
  });
});

module.exports = router;