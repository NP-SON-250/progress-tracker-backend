import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnector = async () => {
  try {
    const mongoURI = process.env.MONGO_URL;
    if (!mongoURI) {
      throw new Error("MONGO_URL not found in environment variables");
    }

    // Modern connection options (no deprecated options)
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

export default dbConnector;