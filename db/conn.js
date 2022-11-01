const mongoose = require("mongoose");
const uri =
  "mongodb+srv://sachin:sachin@cluster0.9ph1uw3.mongodb.net/sachin?retryWrites=true&w=majority";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection successfully");
  })
  .catch((error) => console.log(`no connection`, error));
