const fs = require('fs');
const files = ['scripts/menu.js', 'scripts/quiz.js', 'scripts/leaderboard.js', 'scripts/auth.js'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // We only replace window.location.href assignments that point to URLs, not window.location.href alone.
    // e.g. window.location.href = "./quiz.html";
    content = content.replace(/window\.location\.href\s*=\s*(['"`].*?['"`]);/g, 'window.navigateTo($1);');
    fs.writeFileSync(file, content);
  }
});
