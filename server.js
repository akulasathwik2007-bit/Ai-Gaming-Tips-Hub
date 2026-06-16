require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');

const app = express();
const port = process.env.PORT || 3000;

// 1. Security: Limit the number of requests from a single IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests
  message: { error: "Too many requests, please try again later." }
});

// 2. Middleware
app.use(cors()); // Allow your frontend to talk to the server
app.use(express.json({ limit: '1kb' })); // Security: Limit request size
app.use(limiter);

// 3. Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 4. Routes
app.get("/", (req, res) => res.send("Server is running successfully."));

app.post("/tips", async (req, res) => {
  const { game } = req.body;

  // Input Validation
  if (!game || typeof game !== 'string' || game.trim().length === 0) {
    return res.status(400).json({ error: "A valid game name is required." });
  }
  
  if (game.length > 50) {
    return res.status(400).json({ error: "Game name is too long." });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert gaming coach. Provide concise, high-level, and actionable strategic advice for the requested game." 
        },
        { 
          role: "user", 
          content: `Give useful gaming tips for ${game.trim()}` 
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7
    });

    res.json({ 
      tips: chatCompletion.choices[0].message.content 
    });

  } catch (error) {
    console.error("GROQ API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch tips from the AI service." });
  }
});

// 5. Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
