const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getDatabase } = require("../config/db");

const router = express.Router();

router.get("/", requireAuth, async (request, response) => {
  try {
    const start = Number(request.query.start);
    const end = Number(request.query.end);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end < start) {
      return response.status(400).json({ message: "Invalid start/end range." });
    }

    const database = getDatabase();
    const [rows] = await database.query(
      `
      SELECT id, question_number, question_text, option_a, option_b, option_c, option_d, explanation, correct_option_index
      FROM questions
      WHERE question_number >= ? AND question_number <= ?
      ORDER BY question_number ASC
      `,
      [start, end]
    );

    const questions = rows.map((row) => ({
      _id: row.id,
      questionNumber: row.question_number,
      questionText: row.question_text,
      options: [
        { text: row.option_a },
        { text: row.option_b },
        { text: row.option_c },
        { text: row.option_d }
      ],
      explanation: row.explanation,
      correctOptionIndex: row.correct_option_index
    }));

    return response.status(200).json({ questions });
  } catch (error) {
    return response.status(500).json({ message: "Failed to get questions.", error: error.message });
  }
});

module.exports = router;
