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
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

module.exports = { Message, connectDB };
