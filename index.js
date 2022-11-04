const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
require("./db/conn.js");
const User = require("./models/user.js");
const Verify = require("./models/verify.js");
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
app.post("/login", async (req, res, next) => {
  try {
    existingUser = await User.findOne({
      username: req.body.username,
      password: req.body.password,
    });
  } catch {
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  if (!existingUser) {
    const error = Error("Username or Password is not correct !");
    return next(error);
  }

  let token;
  try {
    //Creating jwt token
    token = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        password: existingUser.password,
      },
      "secretkeyappearshere",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }

  res.status(200).json({
    success: "User logged in successfully",
    data: {
      userId: existingUser._id,
      username: existingUser.username,
      password: existingUser.password,
      token: token,
    },
  });
});
app.post("/send-otp", async (req, res, next) => {
  var otpCode = Math.floor(1000 + Math.random() * 9000);
  otp = parseInt(otpCode);
  console.log("otp", otp);
  var message = {
    from: "skks@gmail.com",
    to: req.body.email,
    subject: "OTP verification",
    text: "OTP for verification",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold; text-align:center;color:green;'>" +
      "Your OTP is" +
      " " +
      otp +
      "</h1>",
  };
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 25,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "0ecd5cceed5797",
      pass: "7b7c17995dd596",
    },
  });
  transporter.sendMail(message, (err) => {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent!!!");
    }
  });
  res.status(200).json({
    message: "email sent Successfully",
  });
  const userOtp = new Verify({
    email: req.body.email,
    otp: otp,
  });
  await userOtp.save();
});


// verify otp

app.post("/verify-otp", async (req, res) => {
  existingMail = await Verify.findOne({
    email: req.body.email,
  });
  if (existingMail.otp !== req.body.otp) {
    res.status(401).json({
      message: "Invalid OTP"
    })
  }
  const user = await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    otp: existingMail.otp,
  })
  res.status(201).json({
    success: "User Registered successfully",
    data: {
      user
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
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
