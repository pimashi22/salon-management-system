import express from "express";
import cors from "cors";
import routes from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import { firebaseConfig } from "./config/firebase";
import { logger } from "./utils/logger";

const app = express();

try {
  firebaseConfig.initialize();
  logger.info("Firebase initialized successfully");
} catch (error) {
  logger.error("Failed to initialize Firebase:", error);

}

app.use(
  cors({
    origin: ["http://localhost:3000", "https://glow-bridge.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "GlowBridge Backend is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", routes);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
