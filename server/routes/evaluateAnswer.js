import express from "express";
const router = express.Router();

// POST /api/evaluate-answer
router.post("/", (req, res) => {
  const { userAnswer, correctAnswer, explanation } = req.body;
  if (!userAnswer || !correctAnswer) {
    return res.status(400).json({ error: "Missing answer data." });
  }
  const isCorrect = userAnswer === correctAnswer;
  res.json({
    isCorrect,
    feedback: isCorrect
      ? `✅ Correct! ${explanation || ""}`
      : `❌ Incorrect. ${explanation || ""}`
  });
});

export default router;
