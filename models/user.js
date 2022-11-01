// import mongoose from 'mongoose';
const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
    index: { unique: true },
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;