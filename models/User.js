const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  level: Number,
  currentChallenge: {
    type: Schema.ObjectId,
    ref: 'Challange'
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;