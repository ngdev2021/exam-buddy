import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/user-preference
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "No user in token" });
  const user = await User.findByPk(userId);
  res.json({ currentSubject: user.currentSubject });
});

// POST /api/user-preference
router.post("/", authenticateToken, async (req, res) => {
  const { currentSubject } = req.body;
  if (!currentSubject) return res.status(400).json({ error: "Missing currentSubject" });
  const userId = req.user?.userId;
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.currentSubject = currentSubject;
  await user.save();
  res.json({ currentSubject: user.currentSubject });
});

export default router;
