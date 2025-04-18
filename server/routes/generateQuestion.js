import express from "express";
import OpenAI from "openai";
import topics from "../../shared/questionTopics.js";

const router = express.Router();

// POST /api/generate-question
router.post("/", async (req, res) => {
  const { topic } = req.body;
  if (!topic || !topics.includes(topic)) {
    return res.status(400).json({ error: "Invalid or missing topic." });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `You are a helpful and knowledgeable insurance exam tutor.\nGenerate an original multiple-choice question for the topic: ${topic} (Texas Property & Casualty exam).\nProvide exactly four answer choices as a JSON array of strings (not as a single string).\nMark the correct answer with the \"answer\" key, and provide a brief explanation.\nFormat your response as strict JSON with these keys: question (string), choices (array of 4 strings), answer (string), explanation (string).\nExample:\n{\n  \"question\": \"What is the purpose of subrogation in insurance?\",\n  \"choices\": [\"To allow double payment\", \"To reduce premiums\", \"To recover from third parties\", \"To eliminate deductibles\"],\n  \"answer\": \"To recover from third parties\",\n  \"explanation\": \"Subrogation allows the insurer to recover the amount paid to the insured from a liable third party.\"\n}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    });
    // Try to parse JSON from response
    const text = completion.choices[0].message.content;
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // fallback: try to extract JSON
      const match = text.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : null;
    }
    if (!data || !data.question) throw new Error("Malformed AI response");
    // Ensure choices is always an array of 4 strings
    if (!Array.isArray(data.choices)) {
      if (typeof data.choices === "string") {
        data.choices = data.choices.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean);
      } else {
        data.choices = [];
      }
    }
    if (!Array.isArray(data.choices) || data.choices.length !== 4 || !data.choices.every(x => typeof x === "string")) {
      return res.status(500).json({ error: "AI response did not return 4 answer choices. Please try again." });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate question.", details: err.message });
  }
});

export default router;
