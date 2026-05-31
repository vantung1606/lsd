const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const htmlPath = `${dir}/quiz.html`;
  const jsPath = `${dir}/scripts/quiz.js`;

  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    // Remove explanation box
    html = html.replace(/\s*<div id="explanation-box" class="explanation hidden"><\/div>/, '');
    fs.writeFileSync(htmlPath, html);
  }

  if (fs.existsSync(jsPath)) {
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Remove explanationBox references
    js = js.replace(/const explanationBox = document\.getElementById\("explanation-box"\);\s*/g, '');
    js = js.replace(/explanationBox\.classList\.add\("hidden"\);\s*/g, '');
    js = js.replace(/explanationBox\.textContent = `Giải thích: \$\{question\.explanation\}`;/g, '');
    js = js.replace(/explanationBox\.classList\.remove\("hidden"\);\s*/g, '');
    
    fs.writeFileSync(jsPath, js);
  }
});
