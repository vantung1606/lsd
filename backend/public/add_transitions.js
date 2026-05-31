const fs = require('fs');
let apiJs = fs.readFileSync('scripts/api.js', 'utf8');

if (!apiJs.includes('document.addEventListener("click"')) {
  apiJs += `
// Global transition logic
document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('.page');
  if (page) {
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
`;
}
fs.writeFileSync('scripts/api.js', apiJs);
