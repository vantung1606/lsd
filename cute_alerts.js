const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  // 1. Inject cuteAlert into api.js
  const apiJsPath = `${dir}/scripts/api.js`;
  if (fs.existsSync(apiJsPath)) {
    let js = fs.readFileSync(apiJsPath, 'utf8');
    if (!js.includes('window.cuteAlert')) {
      js += `\n
window.cuteAlert = function(message) {
  return new Promise(resolve => {
    let modal = document.getElementById('cute-alert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cute-alert-modal';
      modal.className = 'modal hidden';
      modal.innerHTML = \`
        <div class="modal-content cute-alert-content">
          <h3 style="color: #ff5285; margin-bottom: 10px; font-size: 1.4rem;">✨ Thông báo ✨</h3>
          <p id="cute-alert-message" style="color: #666; font-size: 1.1rem; margin-bottom: 25px; font-weight: 600; line-height: 1.5;"></p>
          <button id="cute-alert-ok" class="primary-button" style="padding: 12px 30px; font-size: 1rem;">OK nha!</button>
        </div>
      \`;
      document.body.appendChild(modal);
    }
    document.getElementById('cute-alert-message').textContent = message;
    modal.classList.remove('hidden');
    document.getElementById('cute-alert-ok').onclick = () => {
      modal.classList.add('hidden');
      resolve();
    };
  });
};
window.alert = (msg) => { window.cuteAlert(msg); };
`;
      fs.writeFileSync(apiJsPath, js);
    }
  }

  // 2. Add CSS to styles.css
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.cute-alert-content')) {
      css += `\n
.cute-alert-content {
  border: 4px solid #ff9dbb !important;
  background: #fff5f8 !important;
  animation: bounceIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}`;
      fs.writeFileSync(cssPath, css);
    }
  }

  // 3. Update menu.js
  const menuJsPath = `${dir}/scripts/menu.js`;
  if (fs.existsSync(menuJsPath)) {
    let js = fs.readFileSync(menuJsPath, 'utf8');
    js = js.replace(/alert\(error\.message\);/g, 'await cuteAlert(error.message);');
    fs.writeFileSync(menuJsPath, js);
  }

  // 4. Update leaderboard.js
  const lbJsPath = `${dir}/scripts/leaderboard.js`;
  if (fs.existsSync(lbJsPath)) {
    let js = fs.readFileSync(lbJsPath, 'utf8');
    js = js.replace(/alert\(error\.message\);/g, 'await cuteAlert(error.message);');
    fs.writeFileSync(lbJsPath, js);
  }

  // 5. Update quiz.js
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    // Replace alert("Không có câu hỏi trong phần đã chọn.");
    js = js.replace(/alert\("Không có câu hỏi trong phần đã chọn\."\);/g, 'await cuteAlert("Không có câu hỏi trong phần đã chọn.");');
    
    // Replace alert(error.message);
    js = js.replace(/alert\(error\.message\);/g, 'await cuteAlert(error.message);');
    
    // Replace the setTimeout in submitQuiz
    const oldSetTimeout = `setTimeout(() => {
      alert(
        \`Hoàn thành \${selectedSection.label}! Bạn đúng \${result.result.correctAnswers}/\${result.result.totalQuestions} câu.\`
      );
      window.navigateTo(\`./leaderboard.html?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
    }, 500);`;
    
    const newSetTimeout = `setTimeout(async () => {
      await cuteAlert(
        \`Hoàn thành \${selectedSection.label}! Bạn đúng \${result.result.correctAnswers}/\${result.result.totalQuestions} câu.\`
      );
      window.navigateTo(\`./leaderboard.html?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
    }, 500);`;
    
    js = js.replace(oldSetTimeout, newSetTimeout);
    
    // Also handle case where it might be formatted slightly differently
    const oldSetTimeout2 = `setTimeout(() => {
      alert(
        \`Hoàn thành \${selectedSection.label}! Bạn đúng \${result.result.correctAnswers}/\${result.result.totalQuestions} câu.\`
      );
      window.navigateTo(\`./leaderboard.html?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
    }, 500);`; // just in case
    
    if (js.includes('setTimeout(() => {') && js.includes('Hoàn thành ${selectedSection.label}')) {
       js = js.replace(
         /setTimeout\(\(\) => \{\s*alert\([\s\S]*?\}\);\s*window\.navigateTo\(`\.\/leaderboard\.html\?sectionKey=\$\{encodeURIComponent\(selectedSection\.key\)\}`\);\s*\}, 500\);/g,
         `setTimeout(async () => {
      await cuteAlert(\`Hoàn thành \${selectedSection.label}! Bạn đúng \${result.result.correctAnswers}/\${result.result.totalQuestions} câu.\`);
      window.navigateTo(\`./leaderboard.html?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
    }, 500);`
       );
    }
    
    fs.writeFileSync(quizJsPath, js);
  }
});
