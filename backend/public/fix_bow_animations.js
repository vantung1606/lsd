const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Replace .page padding to fix the bow and add animation classes
css = css.replace(/\.page\s*\{\r?\n\s*padding:\s*20px 16px 40px 16px\s*!important;\r?\n\}/g, 
`.page {
  padding: 45px 16px 40px 16px !important;
  animation: slideInRight 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.page.slide-out {
  animation: slideOutLeft 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.page.slide-out-right {
  animation: slideOutRight 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes slideInRight {
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutLeft {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-50px); opacity: 0; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(50px); opacity: 0; }
}`);

fs.writeFileSync('styles.css', css);
