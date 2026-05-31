const fs = require('fs');

['e:/lsd/lsd/frontend/styles.css', 'e:/lsd/lsd/backend/public/styles.css'].forEach(file => {
  if (fs.existsSync(file)) {
    let css = fs.readFileSync(file, 'utf8');
    
    // Fix multi_replace_file_content mess up if any (by restoring from frontend if backend is broken)
    if (file.includes('backend') && !css.includes('.range-button:active')) {
      css = fs.readFileSync('e:/lsd/lsd/frontend/styles.css', 'utf8');
    }
    
    // Fix the \A newline issue by ensuring white-space: pre !important; is present
    if (!css.includes('white-space: pre !important;')) {
      css = css.replace(
        "content: '🤎\\A 🤎\\A 🤎' !important;", 
        "content: '🤎\\A 🤎\\A 🤎' !important;\n  white-space: pre !important;"
      );
      // Fallback if it was unspaced
      css = css.replace(
        "content: '🤎\\A🤎\\A🤎' !important;", 
        "content: '🤎\\A 🤎\\A 🤎' !important;\n  white-space: pre !important;"
      );
    }
    
    fs.writeFileSync(file, css);
  }
});
