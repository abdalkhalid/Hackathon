const express = require("express");
const bodyParser = require("body-parser");
const { Message, connectDB } = require("../services/db");
const generateWithGemini = require("../services/gemini");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Keywords relevant to Malco.pk logistics & transport services
const malcoKeywords = [
  "truck", "vehicle", "booking", "load", "cargo", "shipment", "delivery",
  "status", "price", "rate", "charges", "refund", "route", "tracking",
  "dispatch", "pickup", "dropoff", "transport", "logistics", "malco"
];

// Determine if the query is relevant to Malco
function isRelevant(query) {
  const text = query.toLowerCase();
  return malcoKeywords.some(keyword => text.includes(keyword));
}

// Simple intent detection for logistics-related queries
function detectIntent(query) {
  const q = query.toLowerCase();
  if (q.includes("book") || q.includes("reserve") || q.includes("truck")) return "VehicleBooking";
  if (q.includes("track") || q.includes("shipment status") || q.includes("delivery status")) return "ShipmentTracking";
  if (q.includes("rate") || q.includes("price") || q.includes("charges")) return "RateInquiry";
  if (q.includes("refund")) return "RefundRequest";
  return "UnknownIntent";
}

// Webhook endpoint
app.post("/api/webhook", async (req, res) => {
  const query = req.body.query || req.body.text || "";
  const intent = detectIntent(query);
  const relevant = isRelevant(query);
  let usedGemini = false;
  let botResponse = "";

  if (!relevant) {
    botResponse = "I'm here to assist with anything related to Malco.pk logistics and transport services. You can ask me about vehicle bookings, rates, shipment tracking, and more.";
  } else {
    switch (intent) {
      case "VehicleBooking":
        botResponse = "Sure! To book a vehicle, please provide the type of truck needed, the pickup and dropoff locations, and the preferred date/time.";
        break;
      case "ShipmentTracking":
        botResponse = "Please share your shipment or tracking ID so I can provide the current status.";
        break;
      case "RateInquiry":
        botResponse = "Rates depend on the route, vehicle type, and cargo load. Please provide those details to get an accurate quote.";
        break;
      case "RefundRequest":
        botResponse = "Sorry for the inconvenience. Kindly share your booking or transaction ID so we can process the refund.";
        break;
      default:
        usedGemini = true;
        botResponse = await generateWithGemini(
          `As Malco.pk's logistics customer support, respond clearly and professionally to: "${query}"`
        );
        break;
    }
  }

  await Message.create({
    userQuery: query,
    botResponse,
    intent,
    usedGemini
  });

  return res.json({
    fulfillmentText: botResponse,
    source: "malco-logistics-webhook"
  });
});

// Export for Vercel
module.exports = app;
