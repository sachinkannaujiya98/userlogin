const express = require("express");
const cors = require("cors");
const app = express();

require("./db/conn.js");
const User = require("./models/user.js");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
// login user
let existingUser;
app.post("./login", async (req, res, next) => {
  try {
    existingUser = await User.findOne({ username: username });
  } catch {
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  if (!existingUser || existingUser.password != password) {
    const error = Error("Wrong details please check at once");
    return next(error);
  }

  let token;
  try {
    //Creating jwt token
    token = jwt.sign(
      { userId: existingUser._id, username: existingUser.username },
      "secretkeyappearshere",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }

  res.status(200).json({
    success: true,
    data: {
      userId: existingUser._id,
      username: existingUser.username,
      password: existingUser.password,
      token: token,
    },
  });
});

// create user
app.post("/signup", async (req, res, next) => {
  const signup = new User({
    username: req.body.username,
    name: req.body.name,
    password: req.body.password,
  });
  try {
    await signup.save();
  } catch {
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: signup.id,
        username: signup.username,
        password: signup.password,
      },
      "secretkeyappearshere",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  res.status(201).json({
    success: true,
    data: {
      userId: signup._id,
      username: signup.username,
      password: signup.password,
      token: token,
    },
  });
});

app.get("/accessRoute", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res._construct
      .status(200)
      .json({ success: false, message: "Error ! please provide token" });
  }

  const decodedToken = jwt.verify(token, "secretkeyappearshere");
  res.status(200).json({
    success: true,
    data: {
      userId: decodedToken.userId,
      username: decodedToken.username,
      password: decodedToken.password,
    },
  });
});
// });

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
