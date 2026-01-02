import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

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

app.get("/test", (c) => {
  const auth = getAuth(c);

  console.log("Auth Info:", auth);
  if (!auth?.userId) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }
  return c.json({ message: "Payment service authenticated" });
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
