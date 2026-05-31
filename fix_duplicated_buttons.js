const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  ['menu.html', 'quiz.html'].forEach(file => {
    const path = `${dir}/${file}`;
    if (fs.existsSync(path)) {
      let html = fs.readFileSync(path, 'utf8');
      
      // Remove all instances of sound-controls block
      const cleanRegex = /<div class="sound-controls">[\s\S]*?<\/div>\s*<\/div>|<div class="sound-controls">[\s\S]*?<\/div>|<button id="music-toggle"[^>]*>[\s\S]*?<\/button>/g;
      html = html.replace(cleanRegex, '');
      
      // Inject it back right after <section class="card scrollable">
      // or right after <button id="exit-button" ...>
      const newControls = `
      <div class="sound-controls">
        <button id="music-toggle" class="sound-toggle-btn" title="Bật/Tắt nhạc nền">🎵</button>
        <button id="meme-toggle" class="sound-toggle-btn playing" title="Bật/Tắt nhạc Meme">🔊</button>
      </div>`;
      
      if (html.includes('<button id="exit-button"')) {
        html = html.replace(/(<button id="exit-button"[^>]*>[\s\S]*?<\/button>)/, '$1' + newControls);
      } else {
        html = html.replace(/(<section class="card[^>]*>)/, '$1' + newControls);
      }
      
      fs.writeFileSync(path, html);
    }
  });
});
