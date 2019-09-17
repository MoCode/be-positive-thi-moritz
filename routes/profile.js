const express = require("express");
const router = express.Router();
//==================== MODEL
const Challenge = require("../models/Challenges");



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

  const user = req.session.user;

  Challenge.find().then(data => {
    user.data = data
    res.render("private", {
      user
    });

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


module.exports = router;