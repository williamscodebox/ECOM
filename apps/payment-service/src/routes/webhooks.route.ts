import { Hono } from "hono";
import Stripe from "stripe";
import stripe from "../utils/stripe";
import { producer } from "../utils/kafka";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

// webhookRoute.get("/", (c) => {
//   return c.json({
//     status: "ok webhook",
//     uptime: process.uptime(),
//     timestamp: Date.now(),
//   });
// });

webhookRoute.post("/stripe", async (c) => {
  const body = await c.req.text();
  const sig = c.req.header("stripe-signature");

  if (!sig) {
    return c.json({ error: "Missing Stripe signature" }, 400);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.log("Webhook verification failed!", error);
    return c.json({ error: "Webhook verification failed!" }, 400);
  }

  console.log("Stripe event received:", event.type);

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      //const cart = JSON.parse(paymentIntent.metadata.cart ?? "");
      const products = JSON.parse(paymentIntent.metadata.cart ?? "[]");
      const userId = paymentIntent.metadata.userId; // Now you have your line items console.log(cart);
      const email = paymentIntent.receipt_email;
      const amount = (paymentIntent.amount_received / 100).toFixed(2);
      const status = paymentIntent.status;

      // Create order using Kafka

      producer.send("payment.successful", {
        value: {
          userId: userId,
          email: email,
          amount: amount,
          status: paymentIntent.status === "succeeded" ? "success" : "failed",
          products: products?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      });

      console.log("Webhook Received", userId, products, email, amount, status);

      break;

    default:
      break;
  }
  return c.json({ received: true });
});

export default webhookRoute;
