const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const path = `${dir}/quiz.html`;
  if (fs.existsSync(path)) {
    let html = fs.readFileSync(path, 'utf8');
    
    if (!html.includes('id="quiz-section-title"')) {
      html = html.replace(
        '<div class="question-container-box">',
        `<div class="quiz-header-section">
          <h1 id="quiz-section-title">Bộ câu hỏi</h1>
          <div id="quiz-question-number-header">Câu hỏi</div>
        </div>

        <div class="question-container-box">`
      );
      fs.writeFileSync(path, html);
    }
  }
});
