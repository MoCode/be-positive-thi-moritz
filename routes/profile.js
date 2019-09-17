const express = require("express");
const router = express.Router();
//==================== MODEL
const Challenge = require("../models/Challenges");
const User = require("../models/User")
const _ = require('lodash')


// create a middleware that checks if a user is logged in

const loginCheck = () => {
  return (req, res, next) => {
    if (req.session.user) {
      // if user is logged in, proceed to the next function
      next();
    } else {
      // else if user is not logged in, redirect to /login
      res.redirect("/login");
    }
  };
};




router.get("/private", loginCheck(), (req, res) => {

  const user = req.session.user
  const userId = user._id
  User.findOne({
      userId
    }).populate("currentChallenge")
    .then(() => {
      console.log(user)
      res.render("private", {
        user
      })
    })
});

router.post("/newchallenge", (req, res) => {
  Challenge.create({
    title: req.body.title,
    description: req.body.description,
    creator: req.session.user.username
  }).then((Challenge) => {
    res.redirect("/private")
  }).catch((err) => {
    console.log("Challenge Post Error: " + err)
  })
})

router.get("/profile", loginCheck(), (req, res) => {
  res.render("profile");
});


router.post("/confirm/:challengeId", (req, res) => {
  const userId = req.session.user._id;
  const challengeId = req.params.challengeId

  User.findOne({
      userId
    })
    .then(user => {
      console.log(user);
      // user.save({
      //   level: user.level + 1
      // })
    }).then((confirm) => {
      res.redirect("/private")
    }).catch((err) => {
      console.log("Challenge Post Error: " + err)
    })
})




module.exports = router;