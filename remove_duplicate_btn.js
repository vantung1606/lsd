const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const htmlPath = `${dir}/quiz.html`;
  const jsPath = `${dir}/scripts/quiz.js`;

  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    // Remove giant-next-button
    html = html.replace(/\s*<button id="giant-next-button" class="primary-button hidden">.*?<\/button>/, '');
    fs.writeFileSync(htmlPath, html);
  }

  if (fs.existsSync(jsPath)) {
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Remove references to giantNextButton
    js = js.replace(/const giantNextButton = document\.getElementById\("giant-next-button"\);\s*/g, '');
    
    js = js.replace(/if \(giantNextButton\) \{\s*giantNextButton\.classList\.add\("hidden"\);\s*\}/g, '');
    js = js.replace(/if \(giantNextButton\) \{\s*giantNextButton\.classList\.remove\("hidden"\);\s*\}/g, '');
    
    js = js.replace(/if \(giantNextButton\) giantNextButton\.textContent = "Nộp bài 🏁";/g, '');
    js = js.replace(/if \(giantNextButton\) giantNextButton\.textContent = "Câu tiếp theo ➜";/g, '');
    
    // Remove event listener block
    js = js.replace(/if \(giantNextButton\) \{\s*giantNextButton\.addEventListener\("click", async \(\) => \{[\s\S]*?\}\);\s*\}/g, '');
    
    fs.writeFileSync(jsPath, js);
  }
});
