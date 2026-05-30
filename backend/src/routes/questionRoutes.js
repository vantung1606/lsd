const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getDatabase } = require("../config/db");
const { QUIZ_SECTIONS, getSectionByKey, buildMockQuestionNumbers } = require("../config/quizSections");

const router = express.Router();

function normalizeRows(rows) {
  return rows.map((row) => ({
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
}

router.get("/sections", requireAuth, (request, response) => {
  return response.status(200).json({ sections: QUIZ_SECTIONS });
});

router.get("/", requireAuth, async (request, response) => {
  try {
    const database = getDatabase();
    const sectionKey = request.query.sectionKey;

    if (sectionKey) {
      const section = getSectionByKey(sectionKey);
      if (!section) {
        return response.status(400).json({ message: "Invalid sectionKey." });
      }

      if (section.type === "range") {
        const [rows] = await database.query(
          `
          SELECT id, question_number, question_text, option_a, option_b, option_c, option_d, explanation, correct_option_index
          FROM questions
          WHERE question_number >= ? AND question_number <= ?
          ORDER BY question_number ASC
          `,
          [section.start, section.end]
        );

        return response.status(200).json({
          section,
          questions: normalizeRows(rows)
        });
      }

      const [allRows] = await database.query(
        `
        SELECT id, question_number, question_text, option_a, option_b, option_c, option_d, explanation, correct_option_index
        FROM questions
        WHERE question_number BETWEEN 1 AND 300
        ORDER BY question_number ASC
        `
      );

      const rowByNumber = new Map(allRows.map((row) => [row.question_number, row]));
      const allNumbers = allRows.map((row) => row.question_number);
      const pickedNumbers = buildMockQuestionNumbers(allNumbers, section.mockExamId, section.totalQuestions);
      const pickedRows = pickedNumbers.map((number) => rowByNumber.get(number)).filter(Boolean);

      return response.status(200).json({
        section,
        questions: normalizeRows(pickedRows)
      });
    }

    // Backward compatibility for old start/end flow.
    const start = Number(request.query.start);
    const end = Number(request.query.end);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end < start) {
      return response.status(400).json({ message: "Invalid start/end range." });
    }

    const [rows] = await database.query(
      `
      SELECT id, question_number, question_text, option_a, option_b, option_c, option_d, explanation, correct_option_index
      FROM questions
      WHERE question_number >= ? AND question_number <= ?
      ORDER BY question_number ASC
      `,
      [start, end]
    );

    return response.status(200).json({ questions: normalizeRows(rows) });
  } catch (error) {
    return response.status(500).json({ message: "Failed to get questions.", error: error.message });
  }
});

module.exports = router;
