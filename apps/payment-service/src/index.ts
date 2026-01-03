import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import stripe from "./utils/stripe.js";

const app = new Hono();

app.use("*", clerkMiddleware());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// app.get("/test", shouldBeUser, (c) => {
//   return c.json({
//     message: "Payment service authenticated",
//     userId: c.get("userId"),
//   });
// });

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

app.get("/stripe-product-price", async (c) => {
  const res = await stripe.prices.list({
    product: "123",
  });

  return c.json(res);
});

const start = async () => {
  try {
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log(`Payment service is running on port 8002`);
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();

// Example of fetching product prices from another service
// app.get("/pay", shouldBeUser, async (c) => {
//   const { products } = await c.req.json();

//   const subtotals = await Promise.all(
//     products.map(async (product: { id: string; quantity: number }) => {
//       const productRes = await fetch(
//         `http://localhost:8000/products/${product.id}`
//       );
//       const productInDb = await productRes.json();
//       return productInDb.price * product.quantity;
//     })
//   );

//   const totalPrice = subtotals.reduce((sum, n) => sum + n, 0);

//   return c.json({
//     message: "Payment service authenticated",
//     userId: c.get("userId"),
//     totalPrice,
//   });
// });
