// Load environment variables from .env file
require("dotenv").config();
const mongoose = require("mongoose");

// Define schema for saving conversation history
const messageSchema = new mongoose.Schema({
  userQuery: { type: String, required: true },
  botResponse: { type: String, required: true },
  intent: { type: String, required: true },
  usedGemini: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Create Message model
const Message = mongoose.model("Message", messageSchema);

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

module.exports = { Message, connectDB };
