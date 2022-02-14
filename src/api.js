const express = require('express');
const serverless = require('serverless-http');
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    'api': 'version 1'
  })
})

router.post("/email", cors(), async (req, res) => {
  let { email, engine, service, mods } = req.body;
  const msg = {
    to: email, // Change to your recipient
    from: "etunetest@outlook.com", // Change to your verified sender
    subject: "Your E-Tune Order",

    html: `<h2>Thank You For Your Order</h2>
  <h4>Order Details</h4>
   <p> Engine: ${engine}, Service: ${service}, Vehicle Modifications: ${mods}<p>
  <p>Cost: $400.00 </p>
  <p>We have received your order, we will send you an email with details within 2 weeks.</p>
  `,
  };
  try {
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log("email error:", error.message);
  }
});

router.post("/email-self", cors(), async (req, res) => {
  let { email, engine, service, mods } = req.body;
  const msg = {
    to: "etunetest2@outlook.com", // Change to your recipient
    from: "etunetest@outlook.com", // Change to your verified sender
    subject: `E-tune Order from ${email}`,

    html: `<h4>Order Details</h4>
   <p> Engine: ${engine}, Service: ${service}, Vehicle Modifications: ${mods}<p>
  <p>Cost: $400.00 </p>
  <p>Customer Email: ${email}</>
  `,
  };
  try {
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email to self sent");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log("email error:", error.message);
  }
});

router.post("/payment", cors(), async (req, res) => {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "E-Tune Company",
      payment_method: id,
      confirm: true,
    });
    console.log("payment", payment.status);
    res.json({
      message: "Payment Successful",
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.json({
      message: "Payment Failed",
      success: false,
    });
  }
});
app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app)