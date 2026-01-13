import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
//import { shouldBeUser } from "./middleware/authMiddleware.js";
//import { consumer, producer } from "./utils/kafka.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3002"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("METHOD:", req.method, "URL:", req.url);
  next();
});

app.use(express.json());

app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// app.get("/test", shouldBeUser, (req, res) => {
//   return res.json({
//     message: "Product service authenticated",
//     userId: req.userId,
//   });
// });

app.use("/users");

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error!" });
});

const start = async () => {
  try {
    // Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(8003, () => {
      console.log("Auth service is running on 8003");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
