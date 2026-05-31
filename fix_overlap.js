const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    
    // Replace the old margin-top: 20px with a larger value and !important to guarantee it works
    css = css.replace(/\.quiz-header-section \{ margin-top: 20px; \}/g, '.quiz-header-section { margin-top: 45px !important; }');
    
    // Also move the exit button up slightly if needed, or leave it at top 15px
    // 15px is fine, but the title needs to move down 45px total.
    
    fs.writeFileSync(cssPath, css);
  }
});
