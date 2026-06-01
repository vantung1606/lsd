# Ứng dụng Web Trắc Nghiệm Lịch sử Đảng (Full-stack)

## 1. Công nghệ sử dụng
- Backend: Node.js, Express, MySQL (`mysql2`), JWT, bcrypt.
- Frontend: HTML, CSS, JavaScript thuần.
- Phong cách UI: Hello Kitty gamification (hồng pastel, biểu tượng dễ thương, font tròn)..

## 2. Cấu trúc thư mục
```text
history-quiz-app/
  backend/
    .env.example
    package.json
    src/
      server.js
      config/db.js
      middleware/authMiddleware.js
      models/
        User.js
        Question.js
        QuizAttempt.js
      routes/
        authRoutes.js
        questionRoutes.js
        quizRoutes.js
        leaderboardRoutes.js
      seed/
        questions.sample.json
        seedQuestions.js
  frontend/
    auth.html
    menu.html
    quiz.html
    leaderboard.html
    styles.css
    scripts/
      api.js
      auth.js
      menu.js
      quiz.js
      leaderboard.js
```

## 3. Cài đặt từ A-Z

### Bước 1: Cài phần mềm cần thiết
- Cài Node.js bản LTS: https://nodejs.org
- Cài MySQL Server 8.x: https://dev.mysql.com/downloads/mysql/

### Bước 2: Tạo file môi trường
1. Vào thư mục `backend`.
2. Copy file `.env.example` thành `.env`.
3. Chỉnh giá trị:
```env
PORT=5000
JWT_SECRET=your_super_secret_key
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=history_quiz_app
```

### Bước 3: Cài dependency
```bash
cd history-quiz-app/backend
npm install
```

### Bước 4: Seed 5 câu hỏi mẫu
```bash
npm run seed
```

### Bước 5: Chạy backend + frontend cùng lúc
Frontend đang được serve tĩnh từ Express.
```bash
npm run dev
```

### Bước 6: Truy cập ứng dụng
- Mở trình duyệt: `http://localhost:5000`
- Quy trình sử dụng:
1. Đăng ký tài khoản.
2. Đăng nhập.
3. Chọn dải câu hỏi.
4. Trả lời từng câu (khóa đáp án ngay, hiện đúng/sai + giải thích ngay).
5. Kết thúc dải câu hỏi, điểm tự gửi về server.
6. Vào Leaderboard xem thứ hạng.

## 4. API đã có sẵn
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/questions?start=X&end=Y`
- `POST /api/quiz/submit`
- `GET /api/leaderboard?limit=10` (hoặc 50)

## 5. Cách import thêm 300 câu hỏi
Bạn chỉ cần chuẩn bị JSON giống cấu trúc mẫu:
```json
[
  {
    "questionNumber": 6,
    "questionText": "Nội dung câu hỏi...",
    "options": [
      { "text": "Đáp án A" },
      { "text": "Đáp án B" },
      { "text": "Đáp án C" },
      { "text": "Đáp án D" }
    ],
    "correctOptionIndex": 2,
    "explanation": "Giải thích tại sao C đúng..."
  }
]
```

Sau đó:
1. Gộp thêm vào file `backend/src/seed/questions.sample.json`.
2. Chạy lại:
```bash
npm run seed
```

Lưu ý: script seed hiện đang xóa toàn bộ `questions`, `quiz_attempts`, `quiz_answers` trước khi import mới.

## 6. Deploy Railway (Node.js + MySQL)
### A. Push code lên GitHub repo `vantung1606/lsd`
```bash
git clone https://github.com/vantung1606/lsd.git
# copy thư mục history-quiz-app vào repo hoặc đưa toàn bộ code app vào root repo
git add .
git commit -m "feat: history quiz app with mysql and leaderboard"
git push origin main
```

### B. Tạo project Railway
1. Vào Railway, tạo project mới từ GitHub repo `vantung1606/lsd`.
2. Trong Railway, add MySQL service.
3. Ở service backend, khai báo biến môi trường:
- `PORT=5000`
- `JWT_SECRET=...`
- `DB_HOST=${{MySQL.MYSQLHOST}}`
- `DB_PORT=${{MySQL.MYSQLPORT}}`
- `DB_USER=${{MySQL.MYSQLUSER}}`
- `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
- `DB_NAME=${{MySQL.MYSQLDATABASE}}`

### C. Start command
- Nếu deploy thư mục `backend` làm root service: `npm start`
- Nếu deploy từ root repo: `cd history-quiz-app/backend && npm install && npm start`

### D. Seed dữ liệu trên Railway
Mở Railway shell và chạy:
```bash
cd history-quiz-app/backend
npm run seed
```

## 7. Gợi ý nâng cấp tiếp theo
- Shuffle câu hỏi và shuffle đáp án.
- Thêm timer cho mỗi câu.
- Tách leaderboard theo tuần/tháng.
- Thêm trang quản trị import câu hỏi qua Excel/CSV.
