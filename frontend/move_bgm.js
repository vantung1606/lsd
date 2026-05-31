const fs = require('fs');

let quizJs = fs.readFileSync('scripts/quiz.js', 'utf8');
let apiJs = fs.readFileSync('scripts/api.js', 'utf8');

// Extract BackgroundMusic from quizJs
const bgMatch = quizJs.match(/class BackgroundMusic \{[\s\S]*?\}\s*const bgMusic = new BackgroundMusic\(\);/);
if (bgMatch) {
  // Remove from quiz.js
  quizJs = quizJs.replace(bgMatch[0], '');
  fs.writeFileSync('scripts/quiz.js', quizJs);
  
  // Add to api.js
  if (!apiJs.includes('class BackgroundMusic')) {
    apiJs += '\n' + bgMatch[0];
    
    // Add global init logic for music
    apiJs += `
// Global music init
document.addEventListener("click", () => {
  const musicDisabled = localStorage.getItem("bg_music_disabled") === "true";
  if (!musicDisabled && !bgMusic.isPlaying) {
    bgMusic.start();
    const btn = document.getElementById("music-toggle");
    if (btn) btn.classList.add("playing");
  }
}, { once: true });

// Check state on load
document.addEventListener('DOMContentLoaded', () => {
  const musicDisabled = localStorage.getItem("bg_music_disabled") === "true";
  const btn = document.getElementById("music-toggle");
  if (!musicDisabled) {
    if (btn) btn.classList.add("playing");
  }
});
`;
    fs.writeFileSync('scripts/api.js', apiJs);
  }
}
