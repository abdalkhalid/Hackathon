require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB, Message } = require("../services/db");
const generateWithGemini = require("../services/gemini");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB once
connectDB();

// Webhook route for Dialogflow
app.post("/api/webhook", async (req, res) => {
  const query = req.body.queryResult?.queryText || "";
  const intent = req.body.queryResult?.intent?.displayName || "UnknownIntent";
  const confidence = req.body.queryResult?.intentDetectionConfidence || 0;

  let usedGemini = false;
  let botResponse = "";

  // Fallback to Gemini if Dialogflow intent is not confident
  if (intent === "Default Fallback Intent" || confidence < 0.6) {
    usedGemini = true;
    botResponse = await generateWithGemini(
      `You are a helpful customer support bot for malco.pk (logistics & transport platform). Answer this: "${query}"`
    );
  } else {
    // Hardcoded intent responses
    switch (intent) {
      case "TrackOrder":
        botResponse = "Sure, please provide your tracking number to check the status.";
        break;
      case "GetPricing":
        botResponse = "Our pricing depends on distance and weight. Visit https://malco.pk/pricing.";
        break;
      default:
        botResponse = "Thanks for reaching out. How can I assist you today?";
    }
  }

  // Save the conversation to MongoDB
  await Message.create({
    userQuery: query,
    botResponse,
    intent,
    usedGemini,
  });

  res.json({
    fulfillmentText: botResponse,
  });
});

// Export the handler for Vercel
module.exports = app;
