const express = require("express");
const bodyParser = require("body-parser");
const { Message, connectDB } = require("../services/db");
const generateWithGemini = require("../services/gemini");

const app = express();
app.use(bodyParser.json());

connectDB();

const kababjeesKeywords = [
  "menu", "burger", "deal", "fries", "chicken", "price", "order",
  "location", "branch", "booking", "delivery", "discount", "refund",
  "complaint", "dine-in", "takeaway", "timing", "opening hours"
];

function isRelevant(query) {
  const text = query.toLowerCase();
  return kababjeesKeywords.some(keyword => text.includes(keyword));
}

function detectIntent(query) {
  const q = query.toLowerCase();
  if (q.includes("menu")) return "MenuInquiry";
  if (q.includes("book") || q.includes("reserve")) return "Booking";
  if (q.includes("order status") || q.includes("track order")) return "OrderStatus";
  if (q.includes("refund")) return "RefundRequest";
  return "UnknownIntent";
}

app.post("/webhook", async (req, res) => {
  const query = req.body.query || req.body.text || "";
  const intent = detectIntent(query);
  const relevant = isRelevant(query);
  let usedGemini = false;
  let botResponse = "";

  if (!relevant) {
    botResponse = "I’m here to help with anything related to Kababjees Fried Chicken. Please let me know how I can assist you with our food, branches, or your order.";
  } else {
    switch (intent) {
      case "MenuInquiry":
        botResponse = "Here is the Kababjees Fried Chicken menu: crispy burgers, spicy fried chicken, fries, drinks, and family meal deals. Would you like to know today’s specials?";
        break;
      case "Booking":
        botResponse = "You can book a table at Kababjees Fried Chicken between 12 PM and 11 PM. Please provide the number of guests and preferred time.";
        break;
      case "OrderStatus":
        botResponse = "Please share your order number, and I will check the status for you.";
        break;
      case "RefundRequest":
        botResponse = "We’re sorry for the inconvenience. Please provide your order number to process the refund.";
        break;
      default:
        usedGemini = true;
        botResponse = await generateWithGemini(`As Kababjees Fried Chicken's customer support, respond confidently and clearly to: "${query}"`);
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
    source: "kababjees-fried-chicken-webhook"
  });
});

// Required for Vercel
module.exports = app;
