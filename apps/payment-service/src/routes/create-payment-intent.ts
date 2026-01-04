import { Hono } from "hono";
import { shouldBeUser } from "../middleware/authMiddleware";
import stripe from "../utils/stripe";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  // 1. Calculate total
  let totalAmountInCents = 0;
  for (const item of cart) {
    const unitAmount = await getStripeProductPrice(item.id);
    // const priceInCents = Math.round(Number(unitAmount) * 100);
    const priceInCents = Math.round(Number(unitAmount));
    totalAmountInCents += priceInCents * item.quantity;
  }
  console.log("Total amount in cents:", totalAmountInCents);

  // const lineItems = [
  //   {
  //     price_data: {
  //       currency: "usd",
  //       product_data: {
  //         name: "Sample Product",
  //       },
  //       unit_amount: 5000, // $50.00
  //     },
  //     quantity: 1,
  //   },
  // ];

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    return c.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

// sessionRoute.get("/:session_id", async (c) => {
//   const { session_id } = c.req.param();
//   const session = await stripe.checkout.sessions.retrieve(
//     session_id as string,
//     {
//       expand: ["line_items"],
//     }
//   );

//   console.log(session);

//   return c.json({
//     status: session.status,
//     paymentStatus: session.payment_status,
//   });
// });

export default sessionRoute;
