const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const TESSERACT_PATH = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";
const TESSDATA_DIR = "C:\\tmp\\tessdata";
const SCREENSHOT_GLOB_PREFIX = "z7881618";
const SCREENSHOT_DIR = "C:\\Users\\ASUS\\Downloads";

const TABLE_BOUNDS = {
  top: 240,
  bottom: 1550
};

// Estimated column ranges based on screenshot layout.
const COLUMN_RANGES = {
  number: [10, 110],
  question: [60, 240],
  optionA: [240, 400],
  optionB: [400, 560],
  optionC: [560, 720],
  optionD: [720, 870]
};

function runTesseractTsv(imagePath, outputBasePath) {
  execFileSync(
    TESSERACT_PATH,
    [
      imagePath,
      outputBasePath,
      "-l",
      "vie+eng",
      "--tessdata-dir",
      TESSDATA_DIR,
      "--oem",
      "1",
      "--psm",
      "11",
      "-c",
      "tessedit_create_tsv=1"
    ],
    { stdio: "ignore" }
  );
  const tsvPath = `${outputBasePath}.tsv`;
  return fs.readFileSync(tsvPath, "utf8");
}

function parseTsv(tsvText) {
  const lines = tsvText.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) {
    return [];
  }
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split("\t");
    if (parts.length < 12) {
      continue;
    }
    const conf = Number(parts[10]);
    const text = (parts[11] || "").trim();
    if (!text) {
      continue;
    }
    rows.push({
      left: Number(parts[6]),
      top: Number(parts[7]),
      width: Number(parts[8]),
      height: Number(parts[9]),
      conf,
      text
    });
  }
  return rows;
}

function inRange(value, min, max) {
  return value >= min && value <= max;
}

function getQuestionAnchors(words) {
  const rawAnchors = words
    .filter((word) => {
      const matched = word.text.match(/\d{1,3}/);
      if (!matched) {
        return false;
      }
      const num = Number(matched[0]);
      if (num < 1 || num > 300) {
        return false;
      }
      return (
        inRange(word.left, COLUMN_RANGES.number[0], COLUMN_RANGES.number[1]) &&
        inRange(word.top, TABLE_BOUNDS.top, TABLE_BOUNDS.bottom)
      );
    })
    .map((word) => ({
      questionNumber: Number(word.text.match(/\d{1,3}/)[0]),
      top: word.top
    }))
    .sort((a, b) => a.top - b.top);

  // Deduplicate anchors that appear very close vertically.
  const deduped = [];
  for (const anchor of rawAnchors) {
    const last = deduped[deduped.length - 1];
    if (last && Math.abs(anchor.top - last.top) < 12) {
      // Prefer the one with more digits (less likely noise).
      if (String(anchor.questionNumber).length > String(last.questionNumber).length) {
        deduped[deduped.length - 1] = anchor;
      }
      continue;
    }
    deduped.push(anchor);
  }

  if (deduped.length === 0) {
    return deduped;
  }

  // OCR often misreads some row numbers. Normalize each screenshot to a
  // monotonic sequence by estimating the start number from all anchors.
  const offsetCounts = new Map();
  deduped.forEach((anchor, index) => {
    const offset = anchor.questionNumber - index;
    const key = Math.round(offset);
    offsetCounts.set(key, (offsetCounts.get(key) || 0) + 1);
  });
  let bestOffset = deduped[0].questionNumber;
  let bestCount = -1;
  for (const [offset, count] of offsetCounts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestOffset = offset;
    }
  }

  return deduped.map((anchor, index) => ({
    ...anchor,
    questionNumber: bestOffset + index
  }));
}

function normalizeCellText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[|:;,. ]+/, "")
    .replace(/[|]+/g, " ")
    .trim();
}

function collectTextInBand(words, xMin, xMax, yMin, yMax) {
  const selected = words
    .filter((word) => {
      const centerX = word.left + Math.floor(word.width / 2);
      const centerY = word.top + Math.floor(word.height / 2);
      return centerX >= xMin && centerX <= xMax && centerY >= yMin && centerY <= yMax;
    })
    .sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top));

  return normalizeCellText(selected.map((item) => item.text).join(" "));
}

async function yellowRatio(imagePath, xMin, xMax, yMin, yMax) {
  const width = Math.max(1, xMax - xMin);
  const height = Math.max(1, yMax - yMin);
  const { data, info } = await sharp(imagePath)
    .extract({ left: xMin, top: yMin, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let yellowCount = 0;
  const channels = info.channels;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Bright yellow highlight heuristic.
    if (r > 200 && g > 180 && b < 120) {
      yellowCount += 1;
    }
  }
  return yellowCount / (width * height);
}

async function detectCorrectOptionIndex(imagePath, yMin, yMax) {
  const optionRanges = [
    COLUMN_RANGES.optionA,
    COLUMN_RANGES.optionB,
    COLUMN_RANGES.optionC,
    COLUMN_RANGES.optionD
  ];
  const ratios = [];
  for (const [xMin, xMax] of optionRanges) {
    const ratio = await yellowRatio(imagePath, xMin, xMax, yMin, yMax);
    ratios.push(ratio);
  }
  let bestIndex = 0;
  let bestValue = ratios[0];
  for (let i = 1; i < ratios.length; i += 1) {
    if (ratios[i] > bestValue) {
      bestValue = ratios[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}

async function extractQuestionsFromImage(imagePath, temporaryDir) {
  const baseName = path.basename(imagePath, path.extname(imagePath));
  const outputBasePath = path.join(temporaryDir, baseName);
  const tsvText = runTesseractTsv(imagePath, outputBasePath);
  const words = parseTsv(tsvText);
  const anchors = getQuestionAnchors(words);

  const rows = [];
  for (let i = 0; i < anchors.length; i += 1) {
    const current = anchors[i];
    const next = anchors[i + 1];
    const yMin = Math.max(TABLE_BOUNDS.top, current.top - 2);
    const yMax = Math.min(TABLE_BOUNDS.bottom, next ? next.top - 2 : current.top + 48);
    if (yMax <= yMin) {
      continue;
    }

    const questionText = collectTextInBand(
      words,
      COLUMN_RANGES.question[0],
      COLUMN_RANGES.question[1],
      yMin,
      yMax
    );
    const optionA = collectTextInBand(
      words,
      COLUMN_RANGES.optionA[0],
      COLUMN_RANGES.optionA[1],
      yMin,
      yMax
    );
    const optionB = collectTextInBand(
      words,
      COLUMN_RANGES.optionB[0],
      COLUMN_RANGES.optionB[1],
      yMin,
      yMax
    );
    const optionC = collectTextInBand(
      words,
      COLUMN_RANGES.optionC[0],
      COLUMN_RANGES.optionC[1],
      yMin,
      yMax
    );
    const optionD = collectTextInBand(
      words,
      COLUMN_RANGES.optionD[0],
      COLUMN_RANGES.optionD[1],
      yMin,
      yMax
    );

    if (!questionText || (!optionA && !optionB && !optionC && !optionD)) {
      continue;
    }

    const correctOptionIndex = await detectCorrectOptionIndex(imagePath, yMin, yMax);

    rows.push({
      questionNumber: current.questionNumber,
      questionText,
      options: [optionA, optionB, optionC, optionD].map((text) => ({ text: text || "" })),
      correctOptionIndex,
      explanation: "Giải thích sẽ được cập nhật sau khi rà soát nội dung."
    });
  }

  return rows;
}

async function main() {
  const temporaryDir = path.join("C:\\tmp", "ocr_quiz_outputs");
  fs.mkdirSync(temporaryDir, { recursive: true });

  const screenshotPaths = fs
    .readdirSync(SCREENSHOT_DIR)
    .filter((name) => name.startsWith(SCREENSHOT_GLOB_PREFIX) && name.endsWith(".jpg"))
    .map((name) => path.join(SCREENSHOT_DIR, name))
    .sort();

  if (screenshotPaths.length === 0) {
    throw new Error("No screenshot files found.");
  }

  const questionMap = new Map();
  for (const imagePath of screenshotPaths) {
    const extractedRows = await extractQuestionsFromImage(imagePath, temporaryDir);
    for (const row of extractedRows) {
      if (!questionMap.has(row.questionNumber)) {
        questionMap.set(row.questionNumber, row);
      } else {
        // Keep the longer question text in case of overlap.
        const oldRow = questionMap.get(row.questionNumber);
        if ((row.questionText || "").length > (oldRow.questionText || "").length) {
          questionMap.set(row.questionNumber, row);
        }
      }
    }
    console.log(`Processed: ${path.basename(imagePath)} -> ${extractedRows.length} rows`);
  }

  const questions = Array.from(questionMap.values()).sort(
    (a, b) => a.questionNumber - b.questionNumber
  );

  const outPath = path.join(__dirname, "questions.sample.json");
  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf8");
  console.log(`Generated ${questions.length} questions at: ${outPath}`);
}

main().catch((error) => {
  console.error("Extraction failed:", error.message);
  process.exit(1);
});
