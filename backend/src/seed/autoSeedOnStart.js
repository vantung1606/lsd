const { importQuestions } = require("./importQuestions");

function isEnabled(value, defaultValue = true) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  const normalized = String(value).toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

async function autoSeedQuestionsIfNeeded(database) {
  const shouldAutoSeed = isEnabled(process.env.AUTO_SEED_ON_START, true);
  if (!shouldAutoSeed) {
    console.log("Auto seed on start is disabled.");
    return;
  }

  const forceReseed = isEnabled(process.env.AUTO_SEED_FORCE_REPLACE, false);
  const [rows] = await database.query("SELECT COUNT(*) AS total FROM questions");
  const currentCount = Number(rows[0]?.total || 0);

  if (currentCount > 0 && !forceReseed) {
    console.log(`Questions already exist (${currentCount}). Skip auto seed.`);
    return;
  }

  const inserted = await importQuestions(database, { replaceExisting: forceReseed || currentCount > 0 });
  console.log(`Auto seed completed: inserted ${inserted} questions.`);
}

module.exports = {
  autoSeedQuestionsIfNeeded
};
