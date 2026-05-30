const mysql = require("mysql2/promise");

let pool;

async function connectDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
}

module.exports = {
  connectDatabase,
  getDatabase,
  initializeSchema
};
