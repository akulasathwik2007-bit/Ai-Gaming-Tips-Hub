const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/tips", async (req, res) => {
  try {
    const game = req.body.game;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Give useful gaming tips for ${game}`
        }
      ],
      model: "llama-3.1-8b-instant"
    });

    res.json({
      tips: chatCompletion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});