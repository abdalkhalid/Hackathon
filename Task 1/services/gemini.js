const axios = require("axios");

const generateWithGemini = async (query) => {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [{ parts: [{ text: query }] }]
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" }
      }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return generatedText || "Sorry, I couldn’t generate a response right now.";
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return "Sorry, something went wrong with our system. Please try again later.";
  }
};

module.exports = generateWithGemini;
