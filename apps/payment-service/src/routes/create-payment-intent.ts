import { Hono } from "hono";
import { shouldBeUser } from "../middleware/authMiddleware";
import stripe from "../utils/stripe";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const shippingForm = (await c.req.json()).shipping;
  const userId = c.get("userId");
  const simplifiedCart = cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));

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
      shipping: {
        name: shippingForm.name,
        phone: shippingForm.phone,
        address: { line1: shippingForm.address, city: shippingForm.city },
      },
      receipt_email: shippingForm.email, // email goes here
      automatic_payment_methods: { enabled: true },
      metadata: { userId, cart: JSON.stringify(simplifiedCart) },
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

// eventually change the name session Route to payment-intent route which is what these are

sessionRoute.get("/:payment_intent_id", async (c) => {
  const { payment_intent_id } = c.req.param();
  const pi = await stripe.paymentIntents.retrieve(payment_intent_id);

  console.log(pi);

  return c.json({
    status: pi.status,
    amount: pi.amount,
    currency: pi.currency,
  });
});

export default sessionRoute;
