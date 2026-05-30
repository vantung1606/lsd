const QUIZ_SECTIONS = [
  { key: "range-1-50", label: "1 - 50", type: "range", start: 1, end: 50 },
  { key: "range-51-100", label: "51 - 100", type: "range", start: 51, end: 100 },
  { key: "range-101-150", label: "101 - 150", type: "range", start: 101, end: 150 },
  { key: "range-151-200", label: "151 - 200", type: "range", start: 151, end: 200 },
  { key: "range-201-250", label: "201 - 250", type: "range", start: 201, end: 250 },
  { key: "range-251-300", label: "251 - 300", type: "range", start: 251, end: 300 },
  { key: "range-1-100", label: "1 - 100", type: "range", start: 1, end: 100 },
  { key: "range-101-200", label: "101 - 200", type: "range", start: 101, end: 200 },
  { key: "range-201-300", label: "201 - 300", type: "range", start: 201, end: 300 },
  { key: "range-1-300", label: "1 - 300", type: "range", start: 1, end: 300 },
  { key: "mock-1", label: "De thi thu 1 (60 cau)", type: "mock", mockExamId: 1, totalQuestions: 60 },
  { key: "mock-2", label: "De thi thu 2 (60 cau)", type: "mock", mockExamId: 2, totalQuestions: 60 },
  { key: "mock-3", label: "De thi thu 3 (60 cau)", type: "mock", mockExamId: 3, totalQuestions: 60 },
  { key: "mock-4", label: "De thi thu 4 (60 cau)", type: "mock", mockExamId: 4, totalQuestions: 60 },
  { key: "mock-5", label: "De thi thu 5 (60 cau)", type: "mock", mockExamId: 5, totalQuestions: 60 },
  { key: "mock-6", label: "De thi thu 6 (60 cau)", type: "mock", mockExamId: 6, totalQuestions: 60 }
];

function getSectionByKey(sectionKey) {
  return QUIZ_SECTIONS.find((section) => section.key === sectionKey) || null;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMockQuestionNumbers(allQuestionNumbers, mockExamId, totalQuestions = 60) {
  const source = [...allQuestionNumbers];
  const random = mulberry32(10000 + mockExamId * 137);
  for (let i = source.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  return source.slice(0, Math.min(totalQuestions, source.length));
}

module.exports = {
  QUIZ_SECTIONS,
  getSectionByKey,
  buildMockQuestionNumbers
};
