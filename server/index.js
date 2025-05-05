import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./models/index.js";
import User from "./models/User.js";
import UserStat from "./models/UserStat.js";

import generateQuestionRoute from "./routes/generateQuestion.js";
import evaluateAnswerRoute from "./routes/evaluateAnswer.js";
import userStatsRoute from "./routes/userStats.js";
import authRoute from "./routes/auth.js";
import userPreferenceRoute from "./routes/userPreference.js";
import diagnosticsRoute from "./routes/diagnostics.js";
import migrationsRoute from "./routes/migrations.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') {
    console.log('Request body:', req.body);
  }
  next();
});

app.use("/api/generate-question", generateQuestionRoute);
app.use("/api/evaluate-answer", evaluateAnswerRoute);
app.use("/api/user-stats", userStatsRoute);
app.use("/api/auth", authRoute);
app.use("/api/user-preference", userPreferenceRoute);
app.use("/api/diagnostics", diagnosticsRoute);
app.use("/api/migrations", migrationsRoute);

app.get("/", (req, res) => {
  console.log("GET /");
  res.send("OK");
});
app.get("/api/health", (req, res) => {
  console.log("GET /api/health");
  res.json({ status: "ok" });
});
app.get("/api/users", (req, res) => {
  console.log("GET /api/users");
  res.json({ message: "Users endpoint is working" });
});
app.get("/api/diagnostics", (req, res) => {
  console.log("GET /api/diagnostics");
  res.json({ message: "Diagnostics endpoint is working" });
});

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("DB connected and models synced.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
})();

// Express error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});
