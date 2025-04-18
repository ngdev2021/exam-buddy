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

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

app.use("/api/generate-question", generateQuestionRoute);
app.use("/api/evaluate-answer", evaluateAnswerRoute);
app.use("/api/user-stats", userStatsRoute);
app.use("/api/auth", authRoute);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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
