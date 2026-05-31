const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const menuJsPath = `${dir}/scripts/menu.js`;
  if (fs.existsSync(menuJsPath)) {
    let js = fs.readFileSync(menuJsPath, 'utf8');
    
    // Add dataset.key to button
    if (!js.includes('button.dataset.key = section.key;')) {
      js = js.replace(
        'button.className = "secondary-button range-button";',
        'button.className = "secondary-button range-button";\n  button.dataset.key = section.key;'
      );
    }
    
    // Fix renderSections and progress fetching
    const oldCodeRegex = /renderSections\(\);\s*\(\s*async\s*\(\)\s*=>\s*\{\s*try\s*\{[\s\S]*?\}\s*\)\(\);/;
    const newCode = `(async () => {
  await renderSections();
  try {
    const progressRes = await apiRequest("/quiz/progress");
    if (progressRes && progressRes.activeKeys) {
      progressRes.activeKeys.forEach(key => {
        const btn = document.querySelector(\`.range-button[data-key="\${key}"]\`);
        if (btn) {
          btn.classList.add("in-progress");
          if (!btn.querySelector('.progress-badge')) {
            const badge = document.createElement("div");
            badge.className = "progress-badge";
            badge.textContent = "⏳";
            btn.appendChild(badge);
          }
        }
      });
    }
  } catch(e) { console.error(e); }
})();`;
    
    if (js.match(oldCodeRegex)) {
      js = js.replace(oldCodeRegex, newCode);
    } else {
      console.log('Regex did not match in menu.js for dir:', dir);
    }
    
    fs.writeFileSync(menuJsPath, js);
  }

  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.progress-badge')) {
      css += `\n
.progress-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  background: #fff;
  border: 2px solid #ff7ea1;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 5;
  animation: gentlePulse 2s infinite ease-in-out;
}`;
      fs.writeFileSync(cssPath, css);
    }
  }
});
