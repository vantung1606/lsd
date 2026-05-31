const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const apiJsPath = `${dir}/scripts/api.js`;
  if (fs.existsSync(apiJsPath)) {
    let js = fs.readFileSync(apiJsPath, 'utf8');
    
    // Replace the music toggle logic
    const oldMusicLogic = `// Global music toggle logic
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
});`;

    const newMusicLogic = `// Global music toggle logic
document.addEventListener("click", (e) => {
  const musicToggleBtn = e.target.closest('#music-toggle');
  if (musicToggleBtn) {
    if (bgMusic.isPlaying) {
      bgMusic.stop();
      musicToggleBtn.classList.remove("playing");
      localStorage.removeItem("bg_music_enabled");
    } else {
      bgMusic.start();
      musicToggleBtn.classList.add("playing");
      localStorage.setItem("bg_music_enabled", "true");
    }
  } else {
    // Autoplay on first click anywhere ONLY if explicitly enabled
    const musicEnabled = localStorage.getItem("bg_music_enabled") === "true";
    if (musicEnabled && !bgMusic.isPlaying) {
      bgMusic.start();
      const btn = document.getElementById("music-toggle");
      if (btn) btn.classList.add("playing");
    }
  }
});

// Restore button state
document.addEventListener('DOMContentLoaded', () => {
  const musicEnabled = localStorage.getItem("bg_music_enabled") === "true";
  const btn = document.getElementById("music-toggle");
  if (musicEnabled && btn) {
    btn.classList.add("playing");
  }
});`;
    
    js = js.replace(oldMusicLogic, newMusicLogic);
    fs.writeFileSync(apiJsPath, js);
  }
});
