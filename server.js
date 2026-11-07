const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json({ limit: "20kb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20
}));

app.get("/", (req, res) => {
  res.send("HASAN AI Server is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string" || message.length > 5000) {
      return res.status(400).json({ error: "Valid message required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Server API key is not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: "তুমি HASAN AI। বন্ধুসুলভভাবে সহজ বাংলায় উত্তর দাও।",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API request failed"
      });
    }

    res.json({ reply: data.output_text || "কোনো উত্তর পাওয়া যায়নি।" });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HASAN AI server running on ${PORT}`);
});
