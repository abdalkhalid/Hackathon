require("dotenv").config();
const { connectDB, Message } = require("../services/db");
const generateWithGemini = require("../services/gemini");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const query = req.body.queryResult?.queryText || "";
    const intent = req.body.queryResult?.intent?.displayName || "UnknownIntent";
    const confidence = req.body.queryResult?.intentDetectionConfidence || 0;

    let usedGemini = false;
    let botResponse = "";

    if (intent === "Default Fallback Intent" || confidence < 0.6) {
      usedGemini = true;
      botResponse = await generateWithGemini(
        `You are a helpful customer support bot for malco.pk (logistics & transport platform). Answer this: "${query}"`
      );
    } else {
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

    await Message.create({
      userQuery: query,
      botResponse,
      intent,
      usedGemini,
    });

    return res.json({ fulfillmentText: botResponse });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
