const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getDatabase } = require("../config/db");

const router = express.Router();

router.get("/", requireAuth, async (request, response) => {
  try {
    const limit = Math.min(Math.max(Number(request.query.limit) || 10, 1), 50);
    const sectionKey = (request.query.sectionKey || "").trim();
    const database = getDatabase();

    if (!sectionKey || sectionKey === "global") {
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

      return response.status(200).json({ leaderboard, sectionKey: "global" });
    }

    // Ranking per section: best score of each user in that section.
    const [rows] = await database.query(
      `
      SELECT
        u.username,
        MAX(qa.score) AS best_score,
        MAX(qa.correct_answers) AS best_correct_answers,
        COUNT(qa.id) AS attempts_in_section
      FROM quiz_attempts qa
      JOIN users u ON u.id = qa.user_id
      WHERE qa.section_key = ?
      GROUP BY qa.user_id, u.username
      ORDER BY best_score DESC, best_correct_answers DESC, attempts_in_section ASC, u.username ASC
      LIMIT ?
      `,
      [sectionKey, limit]
    );

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      totalCorrectAnswers: row.best_correct_answers,
      totalScore: row.best_score,
      totalAttempts: row.attempts_in_section
    }));

    return response.status(200).json({ leaderboard, sectionKey });
  } catch (error) {
    return response.status(500).json({ message: "Failed to load leaderboard.", error: error.message });
  }
});

module.exports = router;
