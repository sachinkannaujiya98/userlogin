const mongoose = require("mongoose");
const { Schema } = mongoose;
const forgot = new Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
});
const Forgot = mongoose.model("Forgot", forgot);
module.exports = Forgot;
