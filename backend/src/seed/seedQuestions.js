const path = require("path");
const dotenv = require("dotenv");
const { connectDatabase, getDatabase, initializeSchema } = require("../config/db");
const { importQuestions } = require("./importQuestions");

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seedQuestions() {
  try {
    await connectDatabase();
    await initializeSchema();
    const database = getDatabase();

    const inserted = await importQuestions(database, { replaceExisting: true });
    console.log(`Seed success: inserted ${inserted} questions.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedQuestions();
