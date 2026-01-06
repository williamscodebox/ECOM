import { clerkPlugin, getAuth } from "@clerk/fastify";
import Fastify from "fastify";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { orderRoute } from "./routes/order.js";
import { connectOrderDB } from "@repo/order-db";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

fastify.register(clerkPlugin);

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service authenticated",
    userId: request.userId,
  });
});

fastify.register(orderRoute);

/**
 * Run the server!
 */
const start = async () => {
  try {
    Promise.all([
      await connectOrderDB(),
      await producer.connect(),
      await consumer.connect(),
    ]);
    await runKafkaSubscriptions();
    await fastify.listen({ port: 8001 });
    console.log("Order service is running on port 8001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
