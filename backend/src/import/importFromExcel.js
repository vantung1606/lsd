const path = require("path");
const dotenv = require("dotenv");
const XLSX = require("xlsx");
const { connectDatabase, getDatabase, initializeSchema } = require("../config/db");

dotenv.config({ path: path.join(__dirname, "../../.env") });

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function isFilledStyle(cell) {
  const fill = cell?.s;
  if (!fill) {
    return false;
  }
  return fill.patternType === "solid";
}

function detectCorrectOptionIndex(cells) {
  const filled = cells
    .map((cell, index) => ({ index, filled: isFilledStyle(cell) }))
    .filter((item) => item.filled);

  if (filled.length === 1) {
    return filled[0].index;
  }

  // fallback when style is missing/unexpected
  return 0;
}

function readQuestionsFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath, { cellStyles: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"]);

  const questions = [];
  for (let row = 1; row <= range.e.r; row += 1) {
    const rowIndex = row + 1;
    const sttCell = sheet[`A${rowIndex}`];
    const questionCell = sheet[`B${rowIndex}`];
    const optionCells = [
      sheet[`C${rowIndex}`],
      sheet[`D${rowIndex}`],
      sheet[`E${rowIndex}`],
      sheet[`F${rowIndex}`]
    ];

    const questionNumber = Number(sttCell?.v);
    const questionText = normalizeText(questionCell?.v);
    const optionTexts = optionCells.map((cell) => normalizeText(cell?.v));

    if (!Number.isInteger(questionNumber) || questionNumber <= 0) {
      continue;
    }
    if (!questionText) {
      continue;
    }
    if (optionTexts.some((text) => !text)) {
      continue;
    }

    const correctOptionIndex = detectCorrectOptionIndex(optionCells);
    questions.push({
      questionNumber,
      questionText,
      options: optionTexts,
      correctOptionIndex,
      explanation: "Giải thích sẽ cập nhật sau."
    });
  }

  return questions.sort((a, b) => a.questionNumber - b.questionNumber);
}

async function importExcelToDatabase(filePath) {
  await connectDatabase();
  await initializeSchema();
  const database = getDatabase();

  const questions = readQuestionsFromExcel(filePath);

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
        question.options[0],
        question.options[1],
        question.options[2],
        question.options[3],
        question.correctOptionIndex,
        question.explanation
      ]
    );
  }

  const [rows] = await database.query("SELECT COUNT(*) AS total FROM questions");
  console.log(`Import success. Inserted: ${rows[0].total}`);
}

async function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    throw new Error("Missing Excel file path argument.");
  }
  await importExcelToDatabase(inputArg);
  process.exit(0);
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
