const fs = require('fs');

let quizJs = fs.readFileSync('scripts/quiz.js', 'utf8');

// Use split and join to safely remove the BackgroundMusic block
const startIndex = quizJs.indexOf('class BackgroundMusic {');
const endIndex = quizJs.indexOf('class QuizSoundManager {');
if (startIndex !== -1 && endIndex !== -1) {
  quizJs = quizJs.substring(0, startIndex) + quizJs.substring(endIndex);
}

// Remove the event listeners related to bgMusic in quiz.js
quizJs = quizJs.replace(/function toggleMusic\(\) \{[\s\S]*?\}\r?\n/g, '');
quizJs = quizJs.replace(/document\.addEventListener\("click", \(\) => \{[\s\S]*?\}, \{ once: true \}\);\r?\n/g, '');
quizJs = quizJs.replace(/const bgMusic = new BackgroundMusic\(\);\r?\n/g, '');
quizJs = quizJs.replace(/bgMusic\.stop\(\);/g, '');

fs.writeFileSync('scripts/quiz.js', quizJs);
