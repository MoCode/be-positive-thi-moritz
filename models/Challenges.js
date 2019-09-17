const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const challangeSchema = new Schema({
  title: String,
  description: String,
  creator: String,
}, {
  timestamps: true
});

const Challange = mongoose.model("Challange", challangeSchema);

module.exports = Challange;