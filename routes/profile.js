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
  const challenge = req.session.challenge
  const user = req.session.user
  console.log(challenge)
  res.render("private", {
    user,
    challenge
  })
  // User.findOne({
  //     userId
  //   }).populate("currentChallenge")
  //   .then(() => {
  //   })
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
  const user = req.session.user
  User.findOneAndUpdate({
      _id: user._id
    }, {
      level: user.level + 1,
      date: String(new Date())
    })
    .then((nUser) => {
      Challenge.find().then(listOfChallenges => {
        const randIndex = Math.floor(Math.random() * listOfChallenges.length)
        const randChallengeId = listOfChallenges[randIndex]
        nUser.currentChallenge = randChallengeId
        req.session.user = nUser;
        // res.render("private", {
        //   nUser
        // })
        res.redirect("/private");
      })
    }).catch((err) => {
      console.log("Challenge Post Error: " + err)
    })
})

router.post("/nextChallenge/:challengeId", (req, res) => {
  let nUser = req.session.user
  Challenge.find().then((data) => {
    const randIndex = Math.floor(Math.random() * data.length)
    const randChallengeId = data[randIndex]
    nUser.currentChallenge = randChallengeId
    req.session.user = nUser;
    res.redirect("/private")
  }).catch((err) => {
    console.log("Challenge Post Error: " + err)
  })
})





module.exports = router;