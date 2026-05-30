const mysql = require("mysql2/promise");
const { URL } = require("url");

let pool;

function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL || process.env.MYSQL_URL;

  if (databaseUrl) {
    const parsedUrl = new URL(databaseUrl);
    return {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace("/", "")
    };
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.DB_USER || process.env.DB_USERNAME || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE
  };
}

async function connectDatabase() {
  const config = getDatabaseConfig();
  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query("SELECT 1");
  console.log("MySQL connected successfully.");
}

function getDatabase() {
  if (!pool) {
    throw new Error("Database pool is not initialized.");
  }
  return pool;
}

async function initializeSchema() {
  const database = getDatabase();

  // Disable foreign key checks to allow unrestricted schema changes
  await database.query(`SET FOREIGN_KEY_CHECKS = 0`);

  try {
    // Drop ALL legacy tables from previous projects sharing this database
    const legacyTables = ["transactions", "budgets", "categories", "quiz_answers", "quiz_attempts"];
    for (const table of legacyTables) {
      await database.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped table if existed: ${table}`);
    }

    // Check if users table exists but has incompatible schema (wrong id type OR missing columns)
    const [usersIdCheck] = await database.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id'`
    );
    const [passwordHashCheck] = await database.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash'`
    );

    const needsRecreate =
      (usersIdCheck.length > 0 && usersIdCheck[0].COLUMN_TYPE.toLowerCase() !== "int") ||
      (usersIdCheck.length > 0 && passwordHashCheck.length === 0);

    if (needsRecreate) {
      console.log("Users table has incompatible schema, dropping and recreating");
      await database.query(`DROP TABLE IF EXISTS users`);
    }

    // Create users table
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        total_score INT NOT NULL DEFAULT 0,
        total_correct_answers INT NOT NULL DEFAULT 0,
        total_attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if questions table exists and has wrong column type
    const [questionsExists] = await database.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'id'`
    );

    if (questionsExists.length > 0 && questionsExists[0].COLUMN_TYPE.toLowerCase() !== "int") {
      console.log(`Questions table has incompatible id type: ${questionsExists[0].COLUMN_TYPE}, dropping and recreating`);
      await database.query(`DROP TABLE IF EXISTS questions`);
    }

    // Create questions table
    await database.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_number INT NOT NULL UNIQUE,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option_index TINYINT NOT NULL,
        explanation TEXT NOT NULL
      )
    `);

    // Create quiz_attempts table
    await database.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        range_start INT NOT NULL,
        range_end INT NOT NULL,
        total_questions INT NOT NULL,
        correct_answers INT NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create quiz_answers table
    await database.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option_index TINYINT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    console.log("Database schema initialized successfully.");
  } finally {
    // Always re-enable foreign key checks
    await database.query(`SET FOREIGN_KEY_CHECKS = 1`);
  }
}

module.exports = {
  connectDatabase,
  getDatabase,
  initializeSchema
};

