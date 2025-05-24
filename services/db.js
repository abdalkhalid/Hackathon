const mongoose = require("mongoose");

// Define schema for conversation history
const messageSchema = new mongoose.Schema({
  userQuery: { type: String, required: true },
  botResponse: { type: String, required: true },
  intent: { type: String, required: true },
  usedGemini: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Create model
const Message = mongoose.model("Message", messageSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit on failure
  }
};

module.exports = { Message, connectDB };
