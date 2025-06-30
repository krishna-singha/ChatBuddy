import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDatabase } from "./database/db";
import userRouter from "./routes/userRoutes";
import messageRouter from "./routes/messageRoute";
import conversionRouter from "./routes/conversionRoute";
import { setupSocketServer } from "./socket/socketServer";

const PORT = process.env.PORT || 8000;

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api", (_req, res) => {
  res.status(200).send("Server is live");
});

// Routes
app.use("/api/auth", userRouter);
app.use("/api/conversations", conversionRouter);
app.use("/api/messages", messageRouter);

// Setup Socket.IO
setupSocketServer(server);

connectDatabase().then(() => {
  server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  })}).catch((error) => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});
