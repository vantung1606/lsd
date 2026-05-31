const fs = require('fs');

// 1. Update DB Schema
const dbPath = 'e:/lsd/lsd/backend/src/config/db.js';
let dbCode = fs.readFileSync(dbPath, 'utf8');
if (!dbCode.includes('quiz_progress')) {
  dbCode = dbCode.replace(
    'console.log("Database schema initialized successfully.");',
    `await database.query(\`
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
  \`);
  console.log("Database schema initialized successfully.");`
  );
  fs.writeFileSync(dbPath, dbCode);
}

// 2. Update quizRoutes.js
const routesPath = 'e:/lsd/lsd/backend/src/routes/quizRoutes.js';
let routesCode = fs.readFileSync(routesPath, 'utf8');
if (!routesCode.includes('/progress')) {
  routesCode = routesCode.replace(
    'module.exports = router;',
    `router.post("/progress", requireAuth, async (request, response) => {
  try {
    const { sectionKey, currentIndex, answers } = request.body;
    const database = getDatabase();
    
    await database.query(\`
      INSERT INTO quiz_progress (user_id, section_key, current_index, answers_json)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        current_index = VALUES(current_index),
        answers_json = VALUES(answers_json)
    \`, [request.user.userId, sectionKey, currentIndex, JSON.stringify(answers)]);

    return response.status(200).json({ message: "Progress saved." });
  } catch (error) {
    return response.status(500).json({ message: "Failed to save progress.", error: error.message });
  }
});

router.get("/progress", requireAuth, async (request, response) => {
  try {
    const database = getDatabase();
    const sectionKey = request.query.sectionKey;
    if (sectionKey) {
      const [rows] = await database.query(\`
        SELECT current_index, answers_json FROM quiz_progress
        WHERE user_id = ? AND section_key = ?
      \`, [request.user.userId, sectionKey]);
      if (rows.length > 0) {
        return response.status(200).json({ progress: rows[0] });
      }
      return response.status(200).json({ progress: null });
    } else {
      const [rows] = await database.query(\`
        SELECT section_key FROM quiz_progress WHERE user_id = ?
      \`, [request.user.userId]);
      const activeKeys = rows.map(r => r.section_key);
      return response.status(200).json({ activeKeys });
    }
  } catch (error) {
    return response.status(500).json({ message: "Failed to fetch progress.", error: error.message });
  }
});

router.delete("/progress", requireAuth, async (request, response) => {
  try {
    const sectionKey = request.query.sectionKey;
    const database = getDatabase();
    await database.query(\`
      DELETE FROM quiz_progress WHERE user_id = ? AND section_key = ?
    \`, [request.user.userId, sectionKey]);
    return response.status(200).json({ message: "Progress cleared." });
  } catch (error) {
    return response.status(500).json({ message: "Failed to clear progress.", error: error.message });
  }
});

module.exports = router;`
  );
  fs.writeFileSync(routesPath, routesCode);
}

// Update Frontend & Backend Public Files
const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  // Update quiz.html
  const htmlPath = `${dir}/quiz.html`;
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes('id="exit-button"')) {
      html = html.replace(
        '<button id="music-toggle"',
        '<button id="exit-button" class="exit-btn" onclick="window.navigateTo(\'./menu.html\')">🚪 Thoát</button>\n        <button id="music-toggle"'
      );
      fs.writeFileSync(htmlPath, html);
    }
  }

  // Update styles.css
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.exit-btn')) {
      css += `\n
.exit-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #ffcbd6;
  border: 2px solid #ff7ea1;
  color: #c92a54;
  border-radius: 20px;
  padding: 6px 12px;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 100;
  box-shadow: 0 4px 0 #ff7ea1;
  cursor: pointer;
  transition: all 0.1s ease;
}
.exit-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #ff7ea1;
}
.range-button.in-progress::after {
  filter: hue-rotate(180deg) brightness(1.2) drop-shadow(0 3px 3px rgba(0,0,0,0.15)) !important;
}
.range-button.in-progress {
  border: 2px dashed var(--btn-border) !important;
  opacity: 0.95;
}`;
      fs.writeFileSync(cssPath, css);
    }
  }

  // Update quiz.js
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    // Replace localStorage with DB for saveProgress
    js = js.replace(
      'localStorage.setItem(`quiz_progress_${selectedSection.key}`, JSON.stringify(progressData));',
      `// Save to DB
  apiRequest("/quiz/progress", "POST", {
    sectionKey: selectedSection.key,
    currentIndex: currentIndex,
    answers: answers
  }).catch(e => console.error(e));`
    );
    // Replace load in initQuiz
    if (!js.includes('await apiRequest(`/quiz/progress?sectionKey=')) {
      js = js.replace(
        /const savedRaw = localStorage\.getItem\(`quiz_progress_\$\{selectedSection\.key\}`\);[\s\S]*?\} catch \(e\) \{\}/,
        `try {
      const progressRes = await apiRequest(\`/quiz/progress?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
      if (progressRes && progressRes.progress) {
        const saved = progressRes.progress;
        if (saved.answers_json) {
          answers = typeof saved.answers_json === 'string' ? JSON.parse(saved.answers_json) : saved.answers_json;
        }
        if (typeof saved.current_index === 'number' && saved.current_index < questions.length) {
          currentIndex = saved.current_index;
        }
      }
    } catch (e) { console.error(e); }`
      );
    }
    // Replace delete in submitQuiz
    js = js.replace(
      /localStorage\.removeItem\(`quiz_progress_\$\{selectedSection\.key\}`\);/g,
      `apiRequest(\`/quiz/progress?sectionKey=\${encodeURIComponent(selectedSection.key)}\`, "DELETE").catch(e=>console.error(e));`
    );
    fs.writeFileSync(quizJsPath, js);
  }

  // Update menu.js
  const menuJsPath = `${dir}/scripts/menu.js`;
  if (fs.existsSync(menuJsPath)) {
    let js = fs.readFileSync(menuJsPath, 'utf8');
    if (!js.includes('/quiz/progress')) {
      js = js.replace(
        'renderSections();',
        `renderSections();
  try {
    const progressRes = await apiRequest("/quiz/progress");
    if (progressRes && progressRes.activeKeys) {
      progressRes.activeKeys.forEach(key => {
        const btns = document.querySelectorAll(\`.range-button\`);
        btns.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(key)) {
            btn.classList.add("in-progress");
          }
        });
      });
    }
  } catch(e) { console.error(e); }`
      );
      fs.writeFileSync(menuJsPath, js);
    }
  }
});
