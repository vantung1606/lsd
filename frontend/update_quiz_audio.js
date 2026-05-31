const fs = require('fs');
let js = fs.readFileSync('scripts/quiz.js', 'utf8');

// Replace sound manager
js = js.replace(/class QuizSoundManager \{[\s\S]*?\}\s*const sounds = new QuizSoundManager\(\);/g, 
`class QuizSoundManager {
  constructor() {
    this.correctSound = new Audio('https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3');
    this.wrongSound = new Audio('https://www.myinstants.com/media/sounds/bruh.mp3');
    this.finishSound = new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3');
  }

  init() {}
  playStart() {}

  playCorrect() {
    this.correctSound.currentTime = 0;
    this.correctSound.volume = 0.5;
    this.correctSound.play().catch(e => console.warn(e));
  }

  playWrong() {
    this.wrongSound.currentTime = 0;
    this.wrongSound.volume = 0.5;
    this.wrongSound.play().catch(e => console.warn(e));
  }

  playFinish() {
    this.finishSound.currentTime = 0;
    this.finishSound.volume = 0.5;
    this.finishSound.play().catch(e => console.warn(e));
  }
}
const sounds = new QuizSoundManager();`);

// Replace background music
js = js.replace(/class BackgroundMusic \{[\s\S]*?\}\s*const bgMusic = new BackgroundMusic\(\);/g, 
`class BackgroundMusic {
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
const bgMusic = new BackgroundMusic();`);

fs.writeFileSync('scripts/quiz.js', js);
