const fs = require('fs');

let apiJs = fs.readFileSync('scripts/api.js', 'utf8');

if (!apiJs.includes('class BackgroundMusic')) {
  apiJs += `
class BackgroundMusic {
  constructor() {
    this.bgAudio = new Audio('https://www.myinstants.com/media/sounds/kahoot-lobby-music.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.3;
    this.isPlaying = false;
  }

  init() {}

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.bgAudio.play().catch(e => console.warn('BGM play blocked:', e));
  }

  stop() {
    this.isPlaying = false;
    this.bgAudio.pause();
  }
}
const bgMusic = new BackgroundMusic();

// Global music toggle logic
document.addEventListener("click", (e) => {
  const musicToggleBtn = e.target.closest('#music-toggle');
  if (musicToggleBtn) {
    if (bgMusic.isPlaying) {
      bgMusic.stop();
      musicToggleBtn.classList.remove("playing");
      localStorage.setItem("bg_music_disabled", "true");
    } else {
      bgMusic.start();
      musicToggleBtn.classList.add("playing");
      localStorage.removeItem("bg_music_disabled");
    }
  } else {
    // Autoplay on first click anywhere if not disabled
    const musicDisabled = localStorage.getItem("bg_music_disabled") === "true";
    if (!musicDisabled && !bgMusic.isPlaying) {
      bgMusic.start();
      const btn = document.getElementById("music-toggle");
      if (btn) btn.classList.add("playing");
    }
  }
});

// Restore button state
document.addEventListener('DOMContentLoaded', () => {
  const musicDisabled = localStorage.getItem("bg_music_disabled") === "true";
  const btn = document.getElementById("music-toggle");
  if (!musicDisabled && btn) {
    btn.classList.add("playing");
  }
});
`;
  fs.writeFileSync('scripts/api.js', apiJs);
}

// Remove from quiz.js since it's global now
let quizJs = fs.readFileSync('scripts/quiz.js', 'utf8');
quizJs = quizJs.replace(/class BackgroundMusic \{[\s\S]*?\}\s*const bgMusic = new BackgroundMusic\(\);/g, '');
fs.writeFileSync('scripts/quiz.js', quizJs);

