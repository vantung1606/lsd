const fs = require('fs');

['menu.html', 'leaderboard.html'].forEach(file => {
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('id="music-toggle"')) {
      html = html.replace(/<section class="card scrollable">/, '<section class="card scrollable">\n        <button id="music-toggle" class="music-toggle-btn" title="Bật/Tắt nhạc nền">🎵</button>');
      fs.writeFileSync(file, html);
    }
  }
});
