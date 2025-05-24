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

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
           "I'm not sure, could you rephrase that?";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return "Sorry, something went wrong. Please try again later.";
  }
};

module.exports = generateWithGemini;
