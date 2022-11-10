const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Otp = mongoose.model("Otp", userSchema);
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 });
module.exports = Otp;
