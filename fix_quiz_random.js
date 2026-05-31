const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    if (!js.includes('selectedSection.order === "random"')) {
      const initQuizRegex = /(questions = data\.questions \|\| \[\];\s*if \(!questions\.length\) \{[\s\S]*?sounds\.playStart\(\);\s*)(\/\/ Load progress[\s\S]*?\} catch \(e\) \{ console\.error\(e\); \})/;
      
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
      fs.writeFileSync(quizJsPath, js);
    }
  }
});
