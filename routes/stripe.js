const router = require("express").Router();
const keys = require("../config/keys");
const stripe = require("stripe")(keys.stripeSecretKey, {
  apiVersion: "2022-08-01",
});

router.get("/config", (req, res) => {
  res.send({
    publishableKey: keys.stripePublishableKey,
  });
});

router.post("/create-payment-intent", async (req, res) => {
  const { paymentData, payeeData } = req.body.body;
  const { amount, currency } = paymentData;
  const { name, email } = payeeData;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor(amount) * 100,
      description: `Payment by ${name}`,
      currency,
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

router.post("/create-subscription", async (req, res) => {
  const { name, email, paymentMethod, priceId } = req.body;

  const subscriptionExist = await stripe.subscriptions.search({
    query: `status:'active' AND metadata['customerEmail']:'${email}'`,
  });

  if (subscriptionExist.data?.length)
    if (subscriptionExist.data[0].status === "active")
      return res.send({ status: subscriptionExist.data[0].status });

  const customer = await stripe.customers.create({
    name,
    payment_method: paymentMethod,
    email,
    invoice_settings: {
      default_payment_method: paymentMethod,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_settings: {
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: { customerEmail: email },
  });

  res.send({
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    subscriptionId: subscription.id,
  });
});

router.get("/subscription-status", async (req, res) => {
  const { email } = req.body;
  console.log("email", email);
  const subscription = await stripe.subscriptions.search({
    query: `status:'active' AND metadata['customerEmail']:'${email}'`,
  });

  if (subscription.data?.length) {
    return res.send({ status: subscription.data[0].status });
  }
  res.send({ status: "unactive" });
});

module.exports = router;
