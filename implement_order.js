const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  // 1. menu.html - inject modal
  const menuHtmlPath = `${dir}/menu.html`;
  if (fs.existsSync(menuHtmlPath)) {
    let html = fs.readFileSync(menuHtmlPath, 'utf8');
    if (!html.includes('id="order-modal"')) {
      const modalHtml = `
    <div id="order-modal" class="modal hidden">
      <div class="modal-content">
        <h3 style="color: #ff5285; margin-bottom: 10px;">Tùy chọn làm bài</h3>
        <p style="color: #666; font-size: 0.95rem;">Bạn muốn làm các câu hỏi theo thứ tự nào?</p>
        <div class="modal-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
          <button id="btn-sequential" class="primary-button" style="padding: 10px 15px; font-size: 0.9rem;">Theo thứ tự</button>
          <button id="btn-random" class="secondary-button" style="padding: 10px 15px; font-size: 0.9rem;">Lộn xộn</button>
        </div>
        <button id="btn-close-modal" class="close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">✖</button>
      </div>
    </div>
      `;
      html = html.replace('</main>', '</main>' + modalHtml);
      fs.writeFileSync(menuHtmlPath, html);
    }
  }

  // 2. styles.css - add .modal
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.modal.hidden')) {
      css += `\n
.modal {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}
.modal.hidden { display: none; }
.modal-content {
  background: #fff0f5; padding: 25px; border-radius: 20px; text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  max-width: 90%; width: 320px;
  position: relative;
  border: 3px solid #ff7ea1;
}`;
      fs.writeFileSync(cssPath, css);
    }
  }

  // 3. menu.js - add activeQuizKeys and modal logic
  const menuJsPath = `${dir}/scripts/menu.js`;
  if (fs.existsSync(menuJsPath)) {
    let js = fs.readFileSync(menuJsPath, 'utf8');
    
    // Ensure activeQuizKeys is declared
    if (!js.includes('let activeQuizKeys = new Set();')) {
      js = js.replace('const MOCK_KEYS =', 'let activeQuizKeys = new Set();\nconst MOCK_KEYS =');
    }
    
    // Populate activeQuizKeys
    js = js.replace(
      /progressRes\.activeKeys\.forEach\(key => \{/g,
      `activeQuizKeys = new Set(progressRes.activeKeys);\n      progressRes.activeKeys.forEach(key => {`
    );
    
    // Add close modal logic if not exists
    if (!js.includes('btn-close-modal')) {
      js += `\n
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("btn-close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("order-modal").classList.add("hidden");
    });
  }
});`;
    }
    
    // Modify button click listener
    const oldClick = `button.addEventListener("click", () => {
    localStorage.setItem("quiz_section", JSON.stringify(section));
    window.navigateTo("./quiz.html");
  });`;
    const newClick = `button.addEventListener("click", () => {
    if (activeQuizKeys.has(section.key)) {
      localStorage.setItem("quiz_section", JSON.stringify(section));
      window.navigateTo("./quiz.html");
    } else {
      const modal = document.getElementById("order-modal");
      if (modal) {
        modal.classList.remove("hidden");
        document.getElementById("btn-sequential").onclick = () => {
          section.order = "sequential";
          localStorage.setItem("quiz_section", JSON.stringify(section));
          modal.classList.add("hidden");
          window.navigateTo("./quiz.html");
        };
        document.getElementById("btn-random").onclick = () => {
          section.order = "random";
          localStorage.setItem("quiz_section", JSON.stringify(section));
          modal.classList.add("hidden");
          window.navigateTo("./quiz.html");
        };
      }
    }
  });`;
    
    js = js.replace(oldClick, newClick);
    // Fallback if formatting was slightly different
    if (!js.includes('if (activeQuizKeys.has(section.key))')) {
      js = js.replace(
        /button\.addEventListener\("click", \(\) => \{\s*localStorage\.setItem\("quiz_section", JSON\.stringify\(section\)\);\s*window\.navigateTo\("\.\/quiz\.html"\);\s*\}\);/,
        newClick
      );
    }
    fs.writeFileSync(menuJsPath, js);
  }

  // 4. quiz.js - Handle shuffle and saving order
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    // Update saveProgress to include order
    const oldSave = `apiRequest("/quiz/progress", "POST", {
    sectionKey: selectedSection.key,
    currentIndex: currentIndex,
    answers: answers
  })`;
    const newSave = `const payload = { answers, order: questions.map(q => q.id || q._id) };
  apiRequest("/quiz/progress", "POST", {
    sectionKey: selectedSection.key,
    currentIndex: currentIndex,
    answers: payload
  })`;
    js = js.replace(oldSave, newSave);

    // Update initQuiz to shuffle and load order
    if (!js.includes('selectedSection.order === "random"')) {
      const initQuizRegex = /(questions = data\.questions \|\| \[\];\s*if \(!questions\.length\) \{[\s\S]*?sounds\.playStart\(\);\s*)(\/\/ Load progress[\s\S]*?\} catch \(e\) \{ console\.error\(e\); \}\s*\})/;
      
      const newInitQuizLogic = `$1
    if (selectedSection.order === "random") {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    let hasProgress = false;
    // Load progress
    try {
      const progressRes = await apiRequest(\`/quiz/progress?sectionKey=\${encodeURIComponent(selectedSection.key)}\`);
      if (progressRes && progressRes.progress) {
        hasProgress = true;
        const saved = progressRes.progress;
        if (saved.answers_json) {
          const parsed = typeof saved.answers_json === 'string' ? JSON.parse(saved.answers_json) : saved.answers_json;
          if (Array.isArray(parsed)) {
            answers = parsed;
          } else {
            answers = parsed.answers || [];
            if (parsed.order && parsed.order.length > 0) {
              const qMap = new Map(questions.map(q => [q.id || q._id, q]));
              questions = parsed.order.map(id => qMap.get(id)).filter(Boolean);
            }
          }
        }
        if (typeof saved.current_index === 'number' && saved.current_index < questions.length) {
          currentIndex = saved.current_index;
        }
      }
    } catch (e) { console.error(e); }
    
    if (!hasProgress) {
      saveProgress();
    }`;
      
      js = js.replace(initQuizRegex, newInitQuizLogic);
    }
    
    fs.writeFileSync(quizJsPath, js);
  }
});
