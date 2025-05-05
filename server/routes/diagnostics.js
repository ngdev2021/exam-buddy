import express from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public endpoint - no authentication required
router.get("/public", (req, res) => {
  console.log("[DIAGNOSTICS] Public endpoint accessed");
  res.json({
    status: "success",
    message: "Public endpoint is working",
    timestamp: new Date().toISOString()
  });
});

// Protected endpoint - requires authentication
router.get("/protected", authenticateToken, (req, res) => {
  console.log("[DIAGNOSTICS] Protected endpoint accessed by user:", req.user.userId);
  res.json({
    status: "success",
    message: "Protected endpoint is working",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// JWT verification test endpoint
router.post("/verify-token", (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }
  
  console.log("[DIAGNOSTICS] Token verification test");
  console.log("[DIAGNOSTICS] JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("[DIAGNOSTICS] JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[DIAGNOSTICS] Token verified successfully:", decoded);
    res.json({
      status: "success",
      message: "Token is valid",
      decoded,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (err) {
    console.error("[DIAGNOSTICS] Token verification failed:", err.message);
    res.status(400).json({
      status: "error",
      message: "Token verification failed",
      error: err.message
    });
  }
});

// Environment variables check (don't expose sensitive values)
router.get("/env-check", (req, res) => {
  console.log("[DIAGNOSTICS] Environment check");
  res.json({
    status: "success",
    variables: {
      JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
      JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV || "Not set",
      PORT: process.env.PORT || "Not set"
    }
  });
});

export default router;
