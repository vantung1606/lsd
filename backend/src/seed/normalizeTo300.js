const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "questions.sample.json");
const outputPath = inputPath;

function scoreQuestion(question) {
  const textScore = (question.questionText || "").trim().length;
  const options = Array.isArray(question.options) ? question.options : [];
  const optionScore = options.reduce((sum, option) => {
    return sum + ((option && option.text ? option.text.trim() : "").length > 0 ? 1 : 0);
  }, 0);
  return textScore + optionScore * 50;
}

function buildPlaceholder(questionNumber) {
  return {
    questionNumber,
    questionText: `Câu ${questionNumber}: Nội dung cần cập nhật từ nguồn gốc.`,
    options: [
      { text: "Đáp án A (cần cập nhật)" },
      { text: "Đáp án B (cần cập nhật)" },
      { text: "Đáp án C (cần cập nhật)" },
      { text: "Đáp án D (cần cập nhật)" }
    ],
    correctOptionIndex: 0,
    explanation: "Cần cập nhật lời giải từ dữ liệu gốc."
  };
}

function normalize() {
  const raw = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(raw);

  const bestByNumber = new Map();
  for (const item of input) {
    const number = Number(item.questionNumber);
    if (!Number.isInteger(number) || number < 1 || number > 300) {
      continue;
    }

    const normalizedItem = {
      questionNumber: number,
      questionText: (item.questionText || "").trim(),
      options: Array.isArray(item.options)
        ? item.options.slice(0, 4).map((option) => ({ text: (option?.text || "").trim() }))
        : [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex:
        Number.isInteger(item.correctOptionIndex) && item.correctOptionIndex >= 0 && item.correctOptionIndex <= 3
          ? item.correctOptionIndex
          : 0,
      explanation: (item.explanation || "").trim() || "Giải thích sẽ được cập nhật sau khi rà soát nội dung."
    };

    while (normalizedItem.options.length < 4) {
      normalizedItem.options.push({ text: "" });
    }

    const existing = bestByNumber.get(number);
    if (!existing || scoreQuestion(normalizedItem) > scoreQuestion(existing)) {
      bestByNumber.set(number, normalizedItem);
    }
  }

  const fullList = [];
  const missing = [];
  for (let i = 1; i <= 300; i += 1) {
    if (bestByNumber.has(i)) {
      fullList.push(bestByNumber.get(i));
    } else {
      missing.push(i);
      fullList.push(buildPlaceholder(i));
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(fullList, null, 2), "utf8");
  console.log(`Normalized to ${fullList.length} questions. Missing placeholders: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`Missing STT list: ${missing.join(",")}`);
  }
}

normalize();
