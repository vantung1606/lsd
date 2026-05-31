const fs = require('fs');

// 1. Fix quiz.js
let quizJs = fs.readFileSync('scripts/quiz.js', 'utf8');

// Remove BackgroundMusic class
quizJs = quizJs.replace(/class BackgroundMusic \{[\s\S]*?\n\}\n/, '');

// Remove toggleMusic function and the event listener
quizJs = quizJs.replace(/function toggleMusic\(\) \{[\s\S]*?\n\}\n/, '');
quizJs = quizJs.replace(/document\.addEventListener\("click", \(\) => \{[\s\S]*?\}, \{ once: true \}\);\n/, '');

// Remove const bgMusic = new BackgroundMusic();
quizJs = quizJs.replace(/const bgMusic = new BackgroundMusic\(\);\n/, '');

// Remove the event listener at the end of quiz.js that toggles music
quizJs = quizJs.replace(/const musicToggleBtn = document\.getElementById\("music-toggle"\);\nif \(musicToggleBtn\) \{[\s\S]*?\}\n/, '');

fs.writeFileSync('scripts/quiz.js', quizJs);

// 2. Fix styles.css for the \A bug
let css = fs.readFileSync('styles.css', 'utf8');
// Fix the literal \A to actual css escaped \a or \A (with space)
css = css.replace(/content: '🤎\\\\A🤎\\\\A🤎' !important;/g, "content: '🤎\\A 🤎\\A 🤎' !important;");
css = css.replace(/content: '🤎\\\\A🤎\\\\A🤎';/g, "content: '🤎\\A 🤎\\A 🤎';");
fs.writeFileSync('styles.css', css);

// 3. Add floating hearts to api.js
let apiJs = fs.readFileSync('scripts/api.js', 'utf8');
if (!apiJs.includes('floating-hearts-container')) {
  apiJs += `
// Floating hearts animation
function createFloatingHearts() {
  const container = document.createElement('div');
  container.className = 'floating-hearts-container';
  document.body.appendChild(container);
  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['💖', '💕', '🌸', '✨'][Math.floor(Math.random() * 4)];
    heart.style.left = (Math.random() * 90) + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }, 1000);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingHearts);
} else {
  createFloatingHearts();
}
`;
  fs.writeFileSync('scripts/api.js', apiJs);
}

// 4. Add floating hearts CSS to styles.css
if (!css.includes('floating-hearts-container')) {
  css += `
.floating-hearts-container {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
.floating-heart {
  position: absolute;
  bottom: -50px;
  font-size: 1.5rem;
  opacity: 0.7;
  animation: floatUp linear forwards;
}
@keyframes floatUp {
  0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(-110vh) rotate(360deg) scale(1.2); opacity: 0; }
}
`;
  fs.writeFileSync('styles.css', css);
}

