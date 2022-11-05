const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    // index: { unique: true },
  },
  otp: {
    type: String,
    required: true,
    // index: { unique: true },
  },
});
const Otp = mongoose.model("Otp", userSchema);
module.exports = Otp;
