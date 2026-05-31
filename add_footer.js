const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const cssPath = `${dir}/styles.css`;
  const apiPath = `${dir}/scripts/api.js`;

  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.cute-footer-note')) {
      css += `
.cute-footer-note {
  text-align: center;
  font-size: 0.85rem;
  color: #a37c87;
  margin-top: 15px;
  padding: 8px;
  font-weight: 600;
  opacity: 0.85;
  animation: gentlePulse 3s infinite ease-in-out;
  position: relative;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}
.cute-footer-note strong {
  color: #ff5285;
  font-weight: 800;
  font-size: 0.95rem;
}
@keyframes gentlePulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
`;
      fs.writeFileSync(cssPath, css);
    }
  }

  if (fs.existsSync(apiPath)) {
    let apiJs = fs.readFileSync(apiPath, 'utf8');
    if (!apiJs.includes('cute-footer-note')) {
      // Find the DOMContentLoaded event and inject inside
      apiJs = apiJs.replace(
        /document\.addEventListener\('DOMContentLoaded', \(\) => \{\s+const page = document\.querySelector\('\.page'\);\s+if \(page\) \{/,
        `document.addEventListener('DOMContentLoaded', () => {
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
    }`
      );
      fs.writeFileSync(apiPath, apiJs);
    }
  }
});
