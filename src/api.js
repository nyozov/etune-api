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

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    'api': 'version 1'
  })
})

router.get('/payment', (req, res) => {
  res.json({
    "api": 'payment'
  })
})

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