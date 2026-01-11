import { Hono } from "hono";
import { shouldBeUser } from "../middleware/authMiddleware";
import stripe from "../utils/stripe";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  // console.log("cart sent to Stripe:", cart);

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = await getStripeProductPrice(item.id);
      // console.log("unitAmount for item", item.id, "=", unitAmount);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            metadata: { size: item.selectedSize, color: item.selectedColor },
          },
          unit_amount: Math.round(Number(unitAmount) * 100),
        },
        quantity: item.quantity,
      };
    })
  );

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
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      ui_mode: "custom",
      return_url:
        "http://localhost:3003/return?session_id={CHECKOUT_SESSION_ID}",
    });

    // console.log("FULL SESSION:", session);

    // console.log("Created Stripe checkout session:", session.id);
    // console.log("Client secret:", session.client_secret);

    return c.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  // console.log(session);

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});

//export default sessionRoute;
