// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/generate", async (req, res) => {
  const { topic } = req.body;

  try {
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Create a funny meme caption based on current Instagram/social media humor. Topic: ${topic}`,
        },
      ],
    });

    const caption = chatResponse?.data?.choices?.[0]?.message?.content?.trim();

    const imageRes = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(topic)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );
    const imageData = await imageRes.json();
    const imageUrl = imageData.urls?.regular || "";

    res.json({ caption, imageUrl });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Failed to generate meme." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});