import { Hono } from "hono";
import { shouldBeUser } from "../middleware/authMiddleware";
import stripe from "../utils/stripe";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const body = await c.req.json();
  const cart = body.cart;
  const shippingForm = body.shipping;
  const userId = c.get("userId");
  const simplifiedCart = cart.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));
  // 1. Calculate total in cents
  let totalAmountInCents = 0;

  for (const item of cart) {
    const unitAmountInCents = await getStripeProductPrice(item.id); // must return integer cents

    if (unitAmountInCents === null) {
      throw new Error(`Stripe price missing for product ${item.id}`);
    }

    totalAmountInCents += unitAmountInCents * item.quantity;
  }

  // console.log("Total amount in cents:", totalAmountInCents);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "usd",
      shipping: {
        name: shippingForm.name,
        phone: shippingForm.phone,
        address: { line1: shippingForm.address, city: shippingForm.city },
      },
      receipt_email: shippingForm.email,
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

  console.log("Payment Intent Is: ", pi);

  return c.json({
    status: pi.status,
    amount: pi.amount,
    currency: pi.currency,
  });
});

export default sessionRoute;
