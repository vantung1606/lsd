const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const jsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(jsPath)) {
    let js = fs.readFileSync(jsPath, 'utf8');
    // Remove the stray '}'
    js = js.replace(
      /\} catch \(e\) \{ console\.error\(e\); \}\n\s*\}\n\s*renderQuestion\(\);/,
      '} catch (e) { console.error(e); }\n    \n    renderQuestion();'
    );
    fs.writeFileSync(jsPath, js);
  }

  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    // Move header down slightly so it doesn't overlap with buttons
    if (!css.includes('.quiz-header-section { margin-top: 20px; }')) {
      css += '\n.quiz-header-section { margin-top: 20px; }\n';
    }
    
    // Adjust exit-btn slightly
    css = css.replace(/top: 15px;\n  left: 15px;/, 'top: 15px;\n  left: 10px;');
    fs.writeFileSync(cssPath, css);
  }
});
