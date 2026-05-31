const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../../.env") });

async function migrateData() {
  const railwayUrl = process.env.RAILWAY_MYSQL_URL;
  if (!railwayUrl) {
    console.error("Lỗi: Không tìm thấy RAILWAY_MYSQL_URL trong file .env!");
    console.log("Vui lòng thêm biến RAILWAY_MYSQL_URL=... vào file e:\\lsd\\lsd\\backend\\.env rồi chạy lại script này.");
    process.exit(1);
  }

  console.log("Đang kết nối tới DB Local...");
  const localPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "history_quiz_app",
    waitForConnections: true,
  });

  console.log("Đang kết nối tới DB Railway...");
  const railwayPool = mysql.createPool(railwayUrl);

  try {
    // 1. Lấy dữ liệu từ Local
    const [localQuestions] = await localPool.query("SELECT * FROM questions");
    console.log(`Đã lấy ${localQuestions.length} câu hỏi từ Local DB.`);

    if (localQuestions.length === 0) {
      console.log("Không có câu hỏi nào ở Local. Kết thúc.");
      return;
    }

    // 2. Insert vào Railway
    console.log("Bắt đầu đẩy dữ liệu lên Railway...");
    
    // Đảm bảo bảng tồn tại trên Railway trước (chạy initializeSchema logic cơ bản cho bảng questions)
    await railwayPool.query(`
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

    // Dọn sạch bảng cũ trên Railway (để tránh trùng lặp nếu chạy nhiều lần)
    await railwayPool.query("DELETE FROM quiz_answers"); // Xóa khóa ngoại trước
    await railwayPool.query("DELETE FROM questions");

    let successCount = 0;
    for (const q of localQuestions) {
      await railwayPool.query(
        `INSERT INTO questions 
        (question_number, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.question_number, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option_index, q.explanation]
      );
      successCount++;
    }

    console.log(`✅ Hoàn tất! Đã đẩy thành công ${successCount} câu hỏi lên Railway.`);
  } catch (error) {
    console.error("❌ Có lỗi xảy ra trong quá trình copy dữ liệu:", error);
  } finally {
    await localPool.end();
    await railwayPool.end();
  }
}

migrateData();
