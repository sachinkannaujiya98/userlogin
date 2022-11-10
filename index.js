const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
const path = require("path");
require("./db/conn.js");
const User = require("./models/user.js");
const Otp = require("./models/verify.js");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
require("dotenv").config();
const { requiresAuth } = require("express-openid-connect");
const { auth } = require("express-openid-connect");

const imageStorage = multer.diskStorage({
  destination: "public/profile-avatar",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "http://localhost:5000",
  clientID: "WYsTlyGf8Gu0HJUPyWqmEc5QC1aXFmWr",
  issuerBaseURL: "https://dev-0tj2ipjr7ymx2hp3.us.auth0.com",
};
app.use(auth(config));
// ========================facebook login config==============================

// <=====================end facebook config==========================
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// profile image uploading
// For Single image upload
app.post(
  "/uploadImage",
  imageUpload.single("image"),
  (req, res) => {
    res.send(req.file);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
// google  login
app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});
// get user detail login using google account
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});
// login user
let existingUser;
app.post("/signin", async (req, res, next) => {
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
      "s12@dsmaskkkk@ewxsfcvvs",
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
    port: 2525,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "7d8d64197ba865",
      pass: "35fd16b69421f0",
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
  const userOtp = new Otp({
    email: req.body.email,
    otp: otp,
  });
  await userOtp.save();
});
// verify otp
app.post("/sign-up", async (req, res) => {
  existingMail = await Otp.findOne({
    email: req.body.email,
  });
  if (existingMail.otp !== req.body.otp) {
    res.status(401).json({
      message: "Invalid OTP",
    });
  }
  const user = await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // friends: request.body.friends,
    otp: existingMail.otp,
  });
  res.status(201).json({
    success: "User Registered successfully",
    data: {
      user,
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

  const decodedToken = jwt.verify(token, "s12@dsmaskkkk@ewxsfcvvs");
  res.status(200).json({
    success: true,
    data: {
      userId: decodedToken.userId,
      username: decodedToken.username,
      password: decodedToken.password,
    },
  });
});
//  get user by id
app.get("/user/:id", async (req, res) => {
  _id = req.params.id;
  const singleUser = await User.findById(_id);
  return res.status(200).json({ success: true, singleUser });
});
app.put("/user-detail/:id", async (req, res) => {
  _id = req.params.id;
  const data = await User.updateOne(
    { _id },
    {
      discord: req.body.discord,
      twitter: req.body.twitter,
      instagram: req.body.instagram,
      opensea: req.body.opensea,
      linkedin: req.body.linkedin,
      tiktok: req.body.tiktok,
      website: req.body.website,
      aboutme: req.body.aboutme,
    }
  );
  res.status(201).json({
    success: "profile updated successfully",
  });
});
//  ==============forget password=============
app.post("/forget-email", async (req, res) => {
  var code = Math.floor(1000 + Math.random() * 9000);
  otp = parseInt(code);
  console.log("otp", otp);
  existingMail = await User.findOne({
    email: req.body.email,
  });
  if (existingMail) {
    const updatedOtp = await Otp.findOneAndUpdate(
      { email: req.body.email },
      { otp: otp }
    );
    res.status(201).json({
      message: "otp updated successfully",
      updatedOtp,
    });
  } else {
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
      port: 2525,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "7d8d64197ba865",
        pass: "35fd16b69421f0",
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
    const userOtp = new Otp({
      email: req.body.email,
      otp: otp,
    });
    await userOtp.save();
  }
});
// =====================verify otp for reset password================
app.patch("/forget-password", async (req, res) => {
  const existing = await Otp.findOne({
    email: req.body.email,
  });
  if (existing.otp !== req.body.otp) {
    res.status(401).json({
      message: "Invalid OTP",
    });
  } else {
    const user = await User.updateOne(
      { email: req.body.email },
      {
        password: req.body.password,
      }
    );
    res.status(201).json({
      message: "Password updated successfully",
      user,
    });
  }
});
//=============== facebook login route ==============================

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
