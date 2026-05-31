const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  // Update HTML files
  ['menu.html', 'quiz.html'].forEach(file => {
    const path = `${dir}/${file}`;
    if (fs.existsSync(path)) {
      let html = fs.readFileSync(path, 'utf8');
      
      // Replace old music button in menu
      html = html.replace(
        '<button id="music-toggle" class="music-toggle-btn" title="Bật/Tắt nhạc nền">🎵</button>',
        \`<div class="sound-controls">
        <button id="music-toggle" class="sound-toggle-btn" title="Bật/Tắt nhạc nền">🎵</button>
        <button id="meme-toggle" class="sound-toggle-btn playing" title="Bật/Tắt nhạc Meme">🔊</button>
      </div>\`
      );
      
      // Replace old music button in quiz
      const quizMusicRegex = /<button id="music-toggle"[^>]*>[\s\S]*?<\/button>/;
      if (html.match(quizMusicRegex)) {
         html = html.replace(
           quizMusicRegex,
           \`<div class="sound-controls">
        <button id="music-toggle" class="sound-toggle-btn" title="Bật/Tắt nhạc nền">🎵</button>
        <button id="meme-toggle" class="sound-toggle-btn playing" title="Bật/Tắt nhạc Meme">🔊</button>
      </div>\`
         );
      }
      
      fs.writeFileSync(path, html);
    }
  });

  // Update styles.css
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.sound-controls')) {
      css += `\n
.sound-controls {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
  z-index: 100;
}
.sound-toggle-btn {
  background: #ffe3eb;
  border: 2px solid #ff7ea1;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 0 #ff7ea1;
  transition: all 0.1s;
  opacity: 0.6;
  filter: grayscale(1);
}
.sound-toggle-btn.playing {
  opacity: 1;
  filter: none;
  background: #fff;
}
.sound-toggle-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #ff7ea1;
}`;
      fs.writeFileSync(cssPath, css);
    }
  }

  // Update api.js (Meme toggle logic)
  const apiJsPath = `${dir}/scripts/api.js`;
  if (fs.existsSync(apiJsPath)) {
    let js = fs.readFileSync(apiJsPath, 'utf8');
    if (!js.includes('meme-toggle')) {
      js += `\n
// Global meme toggle logic
document.addEventListener("click", (e) => {
  const memeToggleBtn = e.target.closest('#meme-toggle');
  if (memeToggleBtn) {
    const isDisabled = localStorage.getItem("meme_music_disabled") === "true";
    if (isDisabled) {
      localStorage.removeItem("meme_music_disabled");
      memeToggleBtn.classList.add("playing");
    } else {
      localStorage.setItem("meme_music_disabled", "true");
      memeToggleBtn.classList.remove("playing");
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const memeDisabled = localStorage.getItem("meme_music_disabled") === "true";
  const btns = document.querySelectorAll("#meme-toggle");
  btns.forEach(btn => {
    if (memeDisabled) {
      btn.classList.remove("playing");
    } else {
      btn.classList.add("playing");
    }
  });
});
`;
      fs.writeFileSync(apiJsPath, js);
    }
  }

  // Update quiz.js (Meme sound check)
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    // Add check to playCorrect
    if (!js.includes('if (localStorage.getItem("meme_music_disabled") === "true") return;')) {
      js = js.replace(
        'playCorrect() {',
        'playCorrect() {\n    if (localStorage.getItem("meme_music_disabled") === "true") return;'
      );
      js = js.replace(
        'playWrong() {',
        'playWrong() {\n    if (localStorage.getItem("meme_music_disabled") === "true") return;'
      );
      fs.writeFileSync(quizJsPath, js);
    }
  }
});
