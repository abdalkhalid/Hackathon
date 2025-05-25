const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // already connected
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
};

// Define schema here or import from another file
const messageSchema = new mongoose.Schema({
  userQuery: String,
  botResponse: String,
  intent: String,
  usedGemini: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = { connectDB, Message };
