const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    // Replace the old QuizSoundManager
    const newSoundManager = `class QuizSoundManager {
  constructor() {
    this.correctSounds = [
      'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3',
      'https://www.myinstants.com/media/sounds/yippee-tbh.mp3',
      'https://www.myinstants.com/media/sounds/mario-coin.mp3',
      'https://www.myinstants.com/media/sounds/yay_zP2fHn6.mp3',
      'https://www.myinstants.com/media/sounds/correct-ding.mp3',
      'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
      'https://www.myinstants.com/media/sounds/taco-bell-bong-sfx.mp3',
      'https://www.myinstants.com/media/sounds/bell-ding.mp3',
      'https://www.myinstants.com/media/sounds/ta-da-orchestral-fanfare.mp3',
      'https://www.myinstants.com/media/sounds/success-1-sfx.mp3'
    ];

    this.wrongSounds = [
      'https://www.myinstants.com/media/sounds/bruh.mp3',
      'https://www.myinstants.com/media/sounds/sad-trombone.mp3',
      'https://www.myinstants.com/media/sounds/vine-boom.mp3',
      'https://www.myinstants.com/media/sounds/windows-xp-error.mp3',
      'https://www.myinstants.com/media/sounds/fart-with-reverb.mp3',
      'https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3',
      'https://www.myinstants.com/media/sounds/nope.mp3',
      'https://www.myinstants.com/media/sounds/dun-dun-dunnn.mp3',
      'https://www.myinstants.com/media/sounds/spongebob-fail.mp3',
      'https://www.myinstants.com/media/sounds/metal-gear-solid-alert.mp3'
    ];
    
    this.finishSound = new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3');
  }

  init() {}
  playStart() {}

  playCorrect() {
    const url = this.correctSounds[Math.floor(Math.random() * this.correctSounds.length)];
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn(e));
  }

  playWrong() {
    const url = this.wrongSounds[Math.floor(Math.random() * this.wrongSounds.length)];
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn(e));
  }

  playFinish() {
    this.finishSound.currentTime = 0;
    this.finishSound.volume = 0.5;
    this.finishSound.play().catch(e => console.warn(e));
  }
}`;
    
    const regex = /class QuizSoundManager \{[\s\S]*?playFinish\(\) \{[\s\S]*?\}\n\}/;
    if (js.match(regex)) {
      js = js.replace(regex, newSoundManager);
      fs.writeFileSync(quizJsPath, js);
    } else {
      console.log('Regex did not match for QuizSoundManager in', dir);
    }
  }
});
