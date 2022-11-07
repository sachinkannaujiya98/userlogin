// const validator = require("validator");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    type: String,
    // required: true,
  },
  username: {
    type: String,
    // required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    // unique: true,
  },
  discord: {
    type: String,
  },
  twitter: {
    type: String,
  },

  instagram: {
    type: String,
  },
  opensea: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  tiktok: {
    type: String,
  },
  website: {
    type: String,
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
