const API_BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("quiz_token");
}

function getCurrentUser() {
  const raw = localStorage.getItem("quiz_user");
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem("quiz_token", token);
  localStorage.setItem("quiz_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("quiz_token");
  localStorage.removeItem("quiz_user");
  localStorage.removeItem("quiz_range");
}

async function apiRequest(path, method = "GET", body) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API request failed.");
  }
  return data;
}

// Global transition logic
document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('.page');
  if (page) {
    const footerNote = document.createElement('div');
    footerNote.className = 'cute-footer-note';
    footerNote.innerHTML = '✨ Nếu có vấn đề về câu hỏi hay chức năng, hãy liên hệ <strong>Tùng đẹp trai</strong> nhé! ✨';
    
    // Insert into card if possible, otherwise page
    const card = page.querySelector('.card');
    if (card) {
      card.appendChild(footerNote);
    } else {
      page.appendChild(footerNote);
    }
    page.style.opacity = '1';
  }
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href && !link.href.includes('#') && !link.target) {
    e.preventDefault();
    const page = document.querySelector('.page');
    if (page) {
      page.classList.add('slide-out');
    }
    setTimeout(() => {
      window.location.href = link.href;
    }, 280);
  }
});

// Wrapper for manual JS navigation
window.navigateTo = function(url) {
  const page = document.querySelector('.page');
  if (page) {
    page.classList.add('slide-out');
  }
  setTimeout(() => {
    window.location.href = url;
  }, 280);
};

class BackgroundMusic {
  constructor() {
    this.bgAudio = new Audio('https://www.myinstants.com/media/sounds/lofi-beats-to-relax.mp3');
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
});

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


window.cuteAlert = function(message) {
  return new Promise(resolve => {
    let modal = document.getElementById('cute-alert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cute-alert-modal';
      modal.className = 'modal hidden';
      modal.innerHTML = `
        <div class="modal-content cute-alert-content">
          <h3 style="color: #ff5285; margin-bottom: 10px; font-size: 1.4rem;">✨ Thông báo ✨</h3>
          <p id="cute-alert-message" style="color: #666; font-size: 1.1rem; margin-bottom: 25px; font-weight: 600; line-height: 1.5;"></p>
          <button id="cute-alert-ok" class="primary-button" style="padding: 12px 30px; font-size: 1rem;">OK nha!</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('cute-alert-message').textContent = message;
    modal.classList.remove('hidden');
    document.getElementById('cute-alert-ok').onclick = () => {
      modal.classList.add('hidden');
      resolve();
    };
  });
};
window.alert = (msg) => { window.cuteAlert(msg); };
