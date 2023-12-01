const router = require("express").Router();
const keys = require("../config/keys");
const cors = require("cors");
const nodemailer = require("nodemailer");

const senderEmail = keys.email;
const senderPassword = keys.password;


router.post("/", cors(), (req, res) => {
  const { notification, emails } = req.body;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
      user: `${senderEmail}`,
      pass: `${senderPassword}`,
    },
  });

  var mailOptions = {
    from: `"Goosefix" <${senderEmail}>`,
    to: emails,
    subject: `You have recieved a new notification from Goosefix`,
    html: `
            <h3>Notification</h3>
            ${notification}
        `,
  };

  transporter.sendMail(mailOptions, function (error, response) {
    if (response) {
      res.send("Email sent successfully");
    } else {
      res.status(400).send({ error: error.message });
    }
  });
});

module.exports = router;
