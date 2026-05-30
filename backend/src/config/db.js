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

  // Helper: get column type info
  async function getColumnType(tableName, columnName) {
    const [rows] = await database.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, columnName]
    );
    return rows.length > 0 ? rows[0].COLUMN_TYPE : null;
  }

  // Helper: drop ALL foreign keys on a specific table
  async function dropAllForeignKeys(tableName) {
    const [fks] = await database.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [tableName]
    );
    for (const fk of fks) {
      await database.query(`ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
    }
  }

  // Helper: find all FKs referencing a given table.column across ALL tables in the DB, then drop them
  async function dropAllReferencingForeignKeys(referencedTable, referencedColumn) {
    const [refs] = await database.query(
      `SELECT kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
         ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
         AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
         AND tc.TABLE_NAME = kcu.TABLE_NAME
       WHERE kcu.TABLE_SCHEMA = DATABASE()
         AND kcu.REFERENCED_TABLE_NAME = ?
         AND kcu.REFERENCED_COLUMN_NAME = ?
         AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [referencedTable, referencedColumn]
    );
    for (const ref of refs) {
      console.log(`  Dropping FK ${ref.CONSTRAINT_NAME} on ${ref.TABLE_NAME}`);
      await database.query(`ALTER TABLE \`${ref.TABLE_NAME}\` DROP FOREIGN KEY \`${ref.CONSTRAINT_NAME}\``);
    }
    return refs;
  }

  // Helper: check if a table exists
  async function tableExists(tableName) {
    const [rows] = await database.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );
    return rows.length > 0;
  }

  // Drop legacy tables from old project that are NOT part of current schema
  const legacyTables = ["transactions", "budgets", "categories"];
  for (const legacyTable of legacyTables) {
    if (await tableExists(legacyTable)) {
      console.log(`Dropping legacy table: ${legacyTable}`);
      await dropAllForeignKeys(legacyTable);
      await database.query(`DROP TABLE \`${legacyTable}\``);
    }
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

  // Fix users.id type if needed (must drop ALL referencing FKs from ANY table first)
  const usersIdType = await getColumnType("users", "id");
  if (usersIdType && usersIdType.toLowerCase() !== "int") {
    console.log(`Fixing users.id type: ${usersIdType} -> int`);

    // Drop ALL foreign keys from ANY table that references users.id
    await dropAllReferencingForeignKeys("users", "id");

    // Drop quiz tables that we'll recreate
    if (await tableExists("quiz_answers")) {
      await dropAllForeignKeys("quiz_answers");
      await database.query(`DROP TABLE quiz_answers`);
    }
    if (await tableExists("quiz_attempts")) {
      await dropAllForeignKeys("quiz_attempts");
      await database.query(`DROP TABLE quiz_attempts`);
    }

    // Now safely alter users.id
    await database.query(`ALTER TABLE users MODIFY id INT AUTO_INCREMENT`);
  }

  // Fix questions.id type if needed
  const questionsIdType = await getColumnType("questions", "id");
  if (questionsIdType && questionsIdType.toLowerCase() !== "int") {
    console.log(`Fixing questions.id type: ${questionsIdType} -> int`);
    await dropAllReferencingForeignKeys("questions", "id");

    if (await tableExists("quiz_answers")) {
      await dropAllForeignKeys("quiz_answers");
      await database.query(`DROP TABLE quiz_answers`);
    }

    await database.query(`ALTER TABLE questions MODIFY id INT AUTO_INCREMENT`);
  }

  // Create quiz_attempts (with FK to users)
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

  // Create quiz_answers (with FKs to quiz_attempts and questions)
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
}

module.exports = {
  connectDatabase,
  getDatabase,
  initializeSchema
};
