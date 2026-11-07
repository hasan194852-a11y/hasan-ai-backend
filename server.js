const express = require("express");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

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
    const appToken = process.env.HASAN_APP_TOKEN;
    const auth = req.headers.authorization || "";
    const suppliedToken = auth.startsWith("Bearer ")
      ? auth.slice(7)
      : "";

    if (!appToken) {
      return res.status(503).json({ error: "Server security not configured" });
    }

    const a = Buffer.from(suppliedToken);
    const b = Buffer.from(appToken);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      return res.status(502).json({
        error: data.error?.message || "OpenAI API request failed"
      });
    }

    res.json({ reply: data.output_text || "কোনো উত্তর পাওয়া যায়নি।" });

  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HASAN AI server running on ${PORT}`);
});
