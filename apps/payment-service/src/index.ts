import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { shouldBeUser } from "./middleware/authMiddleware.js";

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

app.get("/test", shouldBeUser, (c) => {
  return c.json({
    message: "Payment service authenticated",
    userId: c.get("userId"),
  });
});

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
