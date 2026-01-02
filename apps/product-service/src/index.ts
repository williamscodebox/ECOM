import { clerkMiddleware, getAuth } from "@clerk/express";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/test", (req, res) => {
  const auth = getAuth(req);
  const userIr = auth.userId;
  console.log("Auth Info:", auth);
  if (!userIr) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ message: "Product service authenticated" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    app.listen(8000, () => {
      console.log("Product service is running on 8000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
