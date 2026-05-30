const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { connectDatabase, getDatabase, initializeSchema } = require("../config/db");

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seedQuestions() {
  try {
    await connectDatabase();
    await initializeSchema();
    const database = getDatabase();

    const sampleFilePath = path.join(__dirname, "questions.sample.json");
    const rawData = fs.readFileSync(sampleFilePath, "utf8");
    const questions = JSON.parse(rawData);

    await database.query("DELETE FROM quiz_answers");
    await database.query("DELETE FROM quiz_attempts");
    await database.query("DELETE FROM questions");

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
          question.options[0].text,
          question.options[1].text,
          question.options[2].text,
          question.options[3].text,
          question.correctOptionIndex,
          question.explanation
        ]
      );
    }

    console.log(`Seed success: inserted ${questions.length} questions.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedQuestions();
