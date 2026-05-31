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

async function columnExists(database, tableName, columnName) {
  const [rows] = await database.query(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
    `,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(database, tableName, columnName, columnDefinitionSql) {
  const exists = await columnExists(database, tableName, columnName);
  if (!exists) {
    await database.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinitionSql}`);
  }
}

async function initializeSchema() {
  const database = getDatabase();

  // Keep quiz tables persistent; only remove clearly unrelated legacy tables.
  const legacyTables = ["transactions", "budgets", "categories"];
  for (const table of legacyTables) {
    await database.query(`DROP TABLE IF EXISTS \`${table}\``);
  }

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

  await addColumnIfMissing(database, "quiz_attempts", "section_key", "VARCHAR(80) NOT NULL DEFAULT 'range-1-300'");
  await addColumnIfMissing(database, "quiz_attempts", "section_label", "VARCHAR(120) NOT NULL DEFAULT '1 - 300'");
  await addColumnIfMissing(database, "quiz_attempts", "section_type", "VARCHAR(20) NOT NULL DEFAULT 'range'");

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

  await database.query(`
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      section_key VARCHAR(80) NOT NULL,
      current_index INT NOT NULL DEFAULT 0,
      answers_json JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_section (user_id, section_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  console.log("Database schema initialized successfully.");
}

module.exports = {
  connectDatabase,
  getDatabase,
  initializeSchema
};
