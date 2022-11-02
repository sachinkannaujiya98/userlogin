const nodemailer = require("nodemailer");
var message = {
  from: "skks@gmail.com",
  to: "sachinkannaujiya98@gmail.com",
  subject: "Nodemailer",
  text: "Plaintext version of the message",
  html: '<p style="color:red">HTML version of the message</p>',
};
let transporter = nodemailer.createTransport({
  host: "192.168.29.194",
  port: 10251,
  secure: false, // upgrade later with STARTTLS
  // auth: {
  //   user: "username",
  //   pass: "password",
  // },
});
transporter.sendMail(message, (err) => {
  if (err) {
    console.log("Error occurs");
  }
  console.log("Email sent!!!");
});
