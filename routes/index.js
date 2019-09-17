const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  const user = req.session.user;
  console.log(req.session)
  console.log("req.session.user: ", req.session.user);
  res.render("index", {
    user: user
  });
});


module.exports = router;