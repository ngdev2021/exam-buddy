import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password." });
  try {
    console.log(`[AUTH] Registration attempt for ${email}`);
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log(`[AUTH] Email already registered: ${email}`);
      return res.status(409).json({ error: "Email already registered." });
    }
    
    console.log(`[AUTH] Hashing password`);
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`[AUTH] Password hashed, length: ${passwordHash.length}`);
    
    console.log(`[AUTH] Creating user`);
    const user = await User.create({ email, passwordHash });
    console.log(`[AUTH] User created with ID: ${user.id}`);
    
    console.log(`[AUTH] Generating token`);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log(`[AUTH] Token generated successfully`);
    
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(`[AUTH] Registration error:`, err);
    res.status(500).json({ error: "Registration failed.", details: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password." });
  try {
    console.log(`[AUTH] Login attempt for ${email}`);
    console.log(`[AUTH] JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
    console.log(`[AUTH] JWT_SECRET length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0}`);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }
    
    console.log(`[AUTH] User found, ID: ${user.id}`);
    console.log(`[AUTH] Password hash exists: ${!!user.passwordHash}`);
    console.log(`[AUTH] Password hash length: ${user.passwordHash ? user.passwordHash.length : 0}`);
    
    if (!user.passwordHash) {
      console.error(`[AUTH] Password hash is missing for user: ${email}`);
      return res.status(500).json({ error: "Account configuration error", details: "Password hash is missing" });
    }
    
    try {
      console.log(`[AUTH] Comparing password with bcrypt`);
      const match = await bcrypt.compare(password, user.passwordHash);
      console.log(`[AUTH] Password comparison result: ${match}`);
      
      if (!match) {
        console.log(`[AUTH] Password mismatch for ${email}`);
        return res.status(401).json({ error: "Invalid credentials." });
      }
      
      console.log(`[AUTH] Password match, generating token`);
      
      if (!process.env.JWT_SECRET) {
        console.error(`[AUTH] JWT_SECRET is missing or empty`);
        return res.status(500).json({ error: "Server configuration error", details: "JWT_SECRET is missing" });
      }
      
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log(`[AUTH] Token generated successfully`);
      
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (bcryptErr) {
      console.error(`[AUTH] bcrypt error:`, bcryptErr);
      return res.status(500).json({ error: "Password verification failed", details: bcryptErr.message });
    }
  } catch (err) {
    console.error(`[AUTH] Login error:`, err);
    res.status(500).json({ error: "Login failed.", details: err.message });
  }
});

export default router;
