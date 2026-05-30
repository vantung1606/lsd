const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getDatabase } = require("../config/db");
const { getSectionByKey } = require("../config/quizSections");

const router = express.Router();

router.post("/submit", requireAuth, async (request, response) => {
  try {
    const { start, end, answers, sectionKey } = request.body;
    const section = sectionKey ? getSectionByKey(sectionKey) : null;

    if (!Array.isArray(answers) || answers.length === 0) {
      return response.status(400).json({ message: "Invalid payload." });
    }

    let rangeStart = Number.isInteger(start) ? start : 1;
    let rangeEnd = Number.isInteger(end) ? end : 300;
    let normalizedSectionKey = "range-1-300";
    let sectionLabel = "1 - 300";
    let sectionType = "range";

    if (section) {
      normalizedSectionKey = section.key;
      sectionLabel = section.label;
      sectionType = section.type;
      if (section.type === "range") {
        rangeStart = section.start;
        rangeEnd = section.end;
      } else {
        rangeStart = 1;
        rangeEnd = 300;
      }
    } else if (Number.isInteger(start) && Number.isInteger(end)) {
      normalizedSectionKey = `range-${start}-${end}`;
      sectionLabel = `${start} - ${end}`;
    }

    const database = getDatabase();
    const questionIds = answers.map((item) => Number(item.questionId)).filter(Number.isInteger);
    const placeholders = questionIds.map(() => "?").join(", ");

    const [questions] = await database.query(
      `
      SELECT id, correct_option_index
      FROM questions
      WHERE id IN (${placeholders})
      `,
      questionIds
    );
    const questionMap = new Map(questions.map((question) => [Number(question.id), question]));

    let correctAnswers = 0;
    const normalizedAnswers = answers
      .map((answer) => {
        const questionId = Number(answer.questionId);
        const selectedOptionIndex = Number(answer.selectedOptionIndex);
        const question = questionMap.get(questionId);

        if (!question || !Number.isInteger(selectedOptionIndex)) {
          return null;
        }

        const isCorrect = question.correct_option_index === selectedOptionIndex;
        if (isCorrect) {
          correctAnswers += 1;
        }

        return {
          questionId,
          selectedOptionIndex,
          isCorrect
        };
      })
      .filter(Boolean);

    const totalQuestions = normalizedAnswers.length;
    const score = correctAnswers;

    const [attemptResult] = await database.query(
      `
      INSERT INTO quiz_attempts
      (user_id, range_start, range_end, total_questions, correct_answers, score, section_key, section_label, section_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        request.user.userId,
        rangeStart,
        rangeEnd,
        totalQuestions,
        correctAnswers,
        score,
        normalizedSectionKey,
        sectionLabel,
        sectionType
      ]
    );
    const attemptId = attemptResult.insertId;

    for (const answer of normalizedAnswers) {
      await database.query(
        `
        INSERT INTO quiz_answers (quiz_attempt_id, question_id, selected_option_index, is_correct)
        VALUES (?, ?, ?, ?)
        `,
        [attemptId, answer.questionId, answer.selectedOptionIndex, answer.isCorrect]
      );
    }

    await database.query(
      `
      UPDATE users
      SET total_score = total_score + ?,
          total_correct_answers = total_correct_answers + ?,
          total_attempts = total_attempts + 1
      WHERE id = ?
      `,
      [score, correctAnswers, request.user.userId]
    );

    const [users] = await database.query(
      "SELECT username, total_score, total_correct_answers, total_attempts FROM users WHERE id = ? LIMIT 1",
      [request.user.userId]
    );
    const updatedUser = users[0];

    return response.status(201).json({
      message: "Quiz submitted successfully.",
      result: {
        attemptId,
        sectionKey: normalizedSectionKey,
        sectionLabel,
        totalQuestions,
        correctAnswers,
        score
      },
      user: {
        username: updatedUser.username,
        totalScore: updatedUser.total_score,
        totalCorrectAnswers: updatedUser.total_correct_answers,
        totalAttempts: updatedUser.total_attempts
      }
    });
  } catch (error) {
    return response.status(500).json({ message: "Failed to submit quiz.", error: error.message });
  }
});

module.exports = router;
