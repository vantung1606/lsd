const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getDatabase } = require("../config/db");

const router = express.Router();

router.get("/", requireAuth, async (request, response) => {
  try {
    const limit = Math.min(Math.max(Number(request.query.limit) || 10, 1), 50);

    const database = getDatabase();
    const [users] = await database.query(
      `
      SELECT username, total_correct_answers, total_score, total_attempts
      FROM users
      ORDER BY total_correct_answers DESC, total_score DESC, created_at ASC
      LIMIT ?
      `,
      [limit]
    );

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalCorrectAnswers: user.total_correct_answers,
      totalScore: user.total_score,
      totalAttempts: user.total_attempts
    }));

    return response.status(200).json({ leaderboard });
  } catch (error) {
    return response.status(500).json({ message: "Failed to load leaderboard.", error: error.message });
  }
});

module.exports = router;
