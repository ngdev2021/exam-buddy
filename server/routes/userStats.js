import express from "express";
import UserStat from "../models/UserStat.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/user-stats (per-user, auth required)
router.get("/", authenticateToken, async (req, res) => {
  console.log("userStats GET: req.user =", req.user);
  const userId = req.user?.userId;
  if (!userId) {
    console.error("No user in token:", req.user);
    return res.status(401).json({ error: "No user in token" });
  }
  try {
    const stats = await UserStat.findAll({ where: { userId } });
    // Return as topic keyed object for frontend compatibility
    const statsObj = {};
    stats.forEach(stat => {
      statsObj[stat.topic] = {
        total: stat.total,
        correct: stat.correct,
        incorrect: stat.incorrect
      };
    });
    res.json(statsObj);
  } catch (err) {
    console.error("Error in /api/user-stats GET:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/user-stats (update stats, auth required)
// Body: { topic: string, correct: boolean }
router.post("/", authenticateToken, async (req, res) => {
  const { topic, correct } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic." });
  try {
    const userId = req.user?.userId;
    let stat = await UserStat.findOne({ where: { userId, topic } });
    if (!stat) {
      stat = await UserStat.create({ userId, topic, total: 0, correct: 0, incorrect: 0 });
    }
    stat.total += 1;
    if (correct) stat.correct += 1;
    else stat.incorrect += 1;
    await stat.save();
    // Return updated all stats for this user
    const stats = await UserStat.findAll({ where: { userId } });
    const result = {};
    stats.forEach(s => {
      result[s.topic] = { total: s.total, correct: s.correct, incorrect: s.incorrect };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stats." });
  }
});

// POST /api/user-stats/reset (reset stats, auth required)
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    await UserStat.destroy({ where: { userId: req.user.id } });
    res.json({ status: "reset" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset stats." });
  }
});

export default router;
