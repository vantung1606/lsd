const fs = require("fs");
const path = require("path");

function normalizeQuestion(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  while (options.length < 4) {
    options.push({ text: "" });
  }

  return {
    questionNumber: Number(question.questionNumber),
    questionText: String(question.questionText || "").trim(),
    optionA: String(options[0]?.text || "").trim(),
    optionB: String(options[1]?.text || "").trim(),
    optionC: String(options[2]?.text || "").trim(),
    optionD: String(options[3]?.text || "").trim(),
    correctOptionIndex: Number.isInteger(question.correctOptionIndex) ? question.correctOptionIndex : 0,
    explanation: String(question.explanation || "").trim() || "Giải thích đang cập nhật."
  };
}

function readSampleQuestions() {
  const sampleFilePath = path.join(__dirname, "questions.sample.json");
  const rawData = fs.readFileSync(sampleFilePath, "utf8");
  const parsed = JSON.parse(rawData);
  return parsed.map(normalizeQuestion).filter((question) => Number.isInteger(question.questionNumber));
}

async function importQuestions(database, { replaceExisting }) {
  const questions = readSampleQuestions();

  if (replaceExisting) {
    await database.query("DELETE FROM quiz_answers");
    await database.query("DELETE FROM quiz_attempts");
    await database.query("DELETE FROM questions");
  }

  for (const question of questions) {
    await database.query(
      `
      INSERT INTO questions
      (question_number, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        question.questionNumber,
        question.questionText,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctOptionIndex,
        question.explanation
      ]
    );
  }

  return questions.length;
}

module.exports = {
  importQuestions
};
