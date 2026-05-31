const fs = require('fs');

const validTopCode = `class QuizSoundManager {
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
const sounds = new QuizSoundManager();

const sectionRaw = localStorage.getItem("quiz_section");`;

['e:/lsd/lsd/frontend/scripts/quiz.js', 'e:/lsd/lsd/backend/public/scripts/quiz.js'].forEach(file => {
  if (fs.existsSync(file)) {
    let js = fs.readFileSync(file, 'utf8');
    
    // Completely replace everything before 'const sectionRaw'
    const sectionIndex = js.indexOf('const sectionRaw = localStorage.getItem("quiz_section");');
    if (sectionIndex !== -1) {
      js = validTopCode + js.substring(sectionIndex + 'const sectionRaw = localStorage.getItem("quiz_section");'.length);
    }
    
    // Remove the old toggleMusic button listener completely to prevent ReferenceError
    js = js.replace(/const musicToggleBtn = document\.getElementById\("music-toggle"\);\s*if \(musicToggleBtn\) \{\s*musicToggleBtn\.addEventListener\("click", \(e\) => \{\s*e\.stopPropagation\(\);\s*toggleMusic\(\);\s*\}\);\s*\}/g, '');
    
    fs.writeFileSync(file, js);
  }
});
