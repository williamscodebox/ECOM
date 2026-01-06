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

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (error) {
    console.log("Webhook verification failed!");
    return c.json({ error: "Webhook verification failed!" }, 400);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const cart = JSON.parse(paymentIntent.metadata.cart ?? "");
      const products = JSON.parse(paymentIntent.metadata.products ?? "[]");
      const userId = paymentIntent.metadata.userId; // Now you have your line items console.log(cart);
      const email = paymentIntent.metadata.email;
      const amount = paymentIntent.metadata.amount_total;
      const status = paymentIntent.metadata.payment_status;

      // Create order using Kafka

      // producer.send("payment.successful", {
      //   value: {
      //     userId: userId,
      //     email: paymentIntent.metadata.email,
      //     amount: paymentIntent.metadata.amount_total,
      //     status:
      //       paymentIntent.metadata.payment_status === "paid"
      //         ? "success"
      //         : "failed",
      //     products: products?.map((item: any) => ({
      //       name: item.description,
      //       quantity: item.quantity,
      //       price: item.price?.unit_amount,
      //     })),
      //   },
      // });

      console.log(
        "Webhook Received",
        cart,
        userId,
        products,
        email,
        amount,
        status
      );

      break;

    default:
      break;
  }
  return c.json({ received: true });
});

export default webhookRoute;
