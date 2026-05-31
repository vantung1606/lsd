const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const jsPath = `${dir}/scripts/quiz.js`;
  if (!fs.existsSync(jsPath)) return;

  let js = fs.readFileSync(jsPath, 'utf8');

  // 1. Add saveProgress function
  if (!js.includes('function saveProgress()')) {
    js = js.replace(
      'let answers = []; // Indexed by question index to support back navigation cleanly',
      `let answers = []; // Indexed by question index to support back navigation cleanly\n\nfunction saveProgress() {\n  const progressData = {\n    currentIndex,\n    answers\n  };\n  localStorage.setItem(\`quiz_progress_\${selectedSection.key}\`, JSON.stringify(progressData));\n}`
    );
  }

  // 2. Add saveProgress() calls inside handleAnswer
  if (!js.includes('saveProgress();') && js.includes('answers[currentIndex] = {')) {
    js = js.replace(
      /answers\[currentIndex\] = \{\s*questionId: question\._id,\s*selectedOptionIndex\s*\};\s*/g,
      `answers[currentIndex] = {\n    questionId: question._id,\n    selectedOptionIndex\n  };\n  saveProgress();\n\n  `
    );
  }

  // 3. Add saveProgress() inside nextButton and prevButton click handlers
  js = js.replace(/currentIndex \+= 1;\s*renderQuestion\(\);/g, 'currentIndex += 1;\n    saveProgress();\n    renderQuestion();');
  js = js.replace(/currentIndex -= 1;\s*renderQuestion\(\);/g, 'currentIndex -= 1;\n      saveProgress();\n      renderQuestion();');

  // 4. In submitQuiz, remove progress on success
  js = js.replace(/sounds\.playFinish\(\);/g, 'sounds.playFinish();\n    localStorage.removeItem(`quiz_progress_${selectedSection.key}`);');

  // 5. In initQuiz, load progress before renderQuestion
  js = js.replace(
    /sounds\.playStart\(\);\s*renderQuestion\(\);/,
    `sounds.playStart();
    
    // Load progress
    const savedRaw = localStorage.getItem(\`quiz_progress_\${selectedSection.key}\`);
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        if (saved.answers && Array.isArray(saved.answers)) {
          answers = saved.answers;
        }
        if (typeof saved.currentIndex === 'number' && saved.currentIndex < questions.length) {
          currentIndex = saved.currentIndex;
        }
      } catch (e) {}
    }
    
    renderQuestion();`
  );

  // 6. Fix null checks for answers in renderQuestion (JSON.stringify converts undefined to null in arrays)
  js = js.replace(/if \(previousAnswer !== undefined\) \{/g, 'if (previousAnswer !== undefined && previousAnswer !== null) {');

  fs.writeFileSync(jsPath, js);
});
