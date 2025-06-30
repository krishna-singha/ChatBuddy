import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDatabase } from "./database/db";
import userRouter from "./routes/userRoutes";
import messageRouter from "./routes/messageRoute";
import otherUserRouter from "./routes/otherUserRoute";
import { setupSocketServer } from "./socketServer";

const PORT = process.env.PORT || 8000;

// Connect to database first
connectDatabase();

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
app.use("/api/messages", messageRouter);
app.use("/api/other-users", otherUserRouter);

// Setup Socket.IO
setupSocketServer(server);

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
