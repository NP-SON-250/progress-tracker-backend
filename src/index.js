import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import dbConnector from "./app.js";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/index.js";

dotenv.config();

const app = express();

// Security: Trust proxy (for Railway/Heroku)
app.set("trust proxy", 1);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    author: "ZAAIB Ltd",
    message: "Welcome to PTC!",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1", router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "404",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    status: "500",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Database connection
dbConnector();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});