const express = require("express");
const bodyParser = require("body-parser");
const { Message, connectDB } = require("../services/db");
const generateWithGemini = require("../services/gemini");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.post("/api/webhook", async (req, res) => {
  const query = req.body.queryResult?.queryText || "No query";
  const intent = req.body.queryResult?.intent?.displayName || "UnknownIntent";
  const confidence = req.body.queryResult?.intentDetectionConfidence || 0;

  let botResponse = "";
  let usedGemini = false;

  // Fallback to Gemini if confidence is low or fallback intent
  if (intent === "Default Fallback Intent" || confidence < 0.6) {
    usedGemini = true;
    botResponse = await generateWithGemini(
      `Answer this as a helpful assistant for Malco.pk logistics platform: "${query}"`
    );
  } else {
    // Handle normal, known intents (example)
    if (intent === "TrackOrder") {
      botResponse = "Please provide your tracking number to check the order status.";
    } else if (intent === "Pricing") {
      botResponse = "You can view our pricing for shipping at https://malco.pk/pricing.";
    } else {
      botResponse = "Thank you for reaching out. How can I help you today?";
    }
  }

  // Log to MongoDB
  await Message.create({
    userQuery: query,
    botResponse,
    intent,
    usedGemini,
  });

  return res.json({
    fulfillmentText: botResponse,
  });
});

module.exports = app;
