import { clerkPlugin, getAuth } from "@clerk/fastify";
import Fastify from "fastify";

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

fastify.get("/test", (request, reply) => {
  const auth = getAuth(request);
  const userId = auth.userId;
  console.log("Auth Info:", auth);
  if (!userId) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
  return reply.send({ message: "Order service authenticated" });
});

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 8001 });
    console.log("Order service is running on port 8001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
