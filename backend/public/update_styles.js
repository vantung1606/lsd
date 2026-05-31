const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// 1. Update body background
css = css.replace(/body \{\r?\n\s+font-family: "Baloo 2", cursive;\r?\n\s+color: var\(--text-main\);\r?\n\s+background-image: url\('assets\/stitch_background\.png'\);\r?\n\s+background-repeat: repeat;\r?\n\s+background-size: 320px auto;\r?\n\s+background-position: top center;\r?\n\s+background-attachment: scroll;\r?\n\}/g, 
`body {
  font-family: "Baloo 2", cursive;
  color: var(--text-main);
  background-color: #fff0eb;
  background-image: radial-gradient(#ffd6e8 1.5px, transparent 1.5px), radial-gradient(#ffd6e8 1.5px, transparent 1.5px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  background-attachment: fixed;
}`);

// 2. Update h1
css = css.replace(/h1 \{\r?\n[\s\S]*?h1::after \{\r?\n[\s\S]*?\}\r?\n/g, 
`h1 {
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ff7ea1;
  text-shadow: 2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff, 0px 3px 6px rgba(255, 126, 161, 0.3);
}

.title-text {
  color: #ff7ea1;
}

h1::before {
  content: '🌺';
  font-size: 2.2rem;
  margin-right: 2px;
  animation: wobbleBow 4s infinite ease-in-out;
}
`);

// 3. Stat items
css = css.replace(/\.stat-item \{\r?\n[\s\S]*?padding: 24px 10px 10px 10px !important;\r?\n\}/, 
`.stat-item {
  position: relative;
  width: 105px;
  height: 105px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #ffa8c8 0%, #ff8abf 100%) !important;
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  box-shadow: 0 0 15px rgba(255, 95, 168, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.5) !important;
  padding: 10px !important;
}
/* Convert to heart shape using pseudo elements */
.stat-item::before, .stat-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 52px;
  width: 52px;
  height: 80px;
  background: radial-gradient(circle at 50% 30%, #ffa8c8 0%, #ff8abf 100%);
  border-radius: 50px 50px 0 0;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
  z-index: -1;
  box-shadow: 0 -5px 15px rgba(255, 95, 168, 0.2);
}
.stat-item::after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}
.stat-item {
  background: transparent !important;
  box-shadow: none !important;
}
.stat-item .stat-value {
  z-index: 2;
  color: white;
  text-shadow: 0 2px 4px rgba(201, 49, 117, 0.5);
  font-size: 2rem;
  margin-top: 15px;
}
.stat-item .stat-label {
  z-index: 2;
  color: white;
  text-shadow: 0 1px 2px rgba(201, 49, 117, 0.5);
  margin-top: -5px;
  font-size: 0.7rem;
}
`);

// Clean up existing stat-item pseudos
css = css.replace(/\.stat-item::before \{\r?\n[\s\S]*?float 3s infinite ease-in-out;\r?\n\}/g, '');

// 4. Corner chars
css += `
.corner-char {
  position: absolute;
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 2;
  pointer-events: none;
}
.top-left { top: 20px; left: 20px; }
.top-right { top: 20px; right: 20px; }
.bottom-left { bottom: 20px; left: 20px; }
.bottom-right { bottom: 20px; right: 20px; }

.coconut-char {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="60" r="35" fill="%238a5500"/><circle cx="50" cy="55" r="30" fill="%23b8782a"/><circle cx="40" cy="50" r="4" fill="black"/><circle cx="60" cy="50" r="4" fill="black"/><path d="M45,60 Q50,65 55,60" stroke="black" stroke-width="2" fill="none"/><path d="M50,10 L40,30 L60,30 Z" fill="%2333cc80"/><path d="M45,15 L25,25 L45,35 Z" fill="%234dff99"/><path d="M55,15 L75,25 L55,35 Z" fill="%234dff99"/></svg>');
}
.alien-char {
  background-image: url('assets/stitch_sticker_v2.png');
}
`;

// 5. Buttons formatting
css = css.replace(/#range-sections .range-button \{\r?\n[\s\S]*?backwards;\r?\n\}/,
`#range-sections .range-button {
  position: relative;
  background: var(--btn-bg) !important;
  border: none !important;
  border-bottom: 4px solid var(--btn-border) !important;
  color: var(--btn-color) !important;
  border-radius: 30px !important;
  font-weight: 800;
  font-size: 0.95rem !important;
  padding: 12px 2px !important;
  text-align: center;
  transition: transform 0.1s ease, border-width 0.1s ease;
  animation: fadeInUp 0.4s ease-out backwards;
}
#range-sections .range-button::after {
  content: '🎀';
  position: absolute;
  top: -8px;
  right: -5px;
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}
`);
css = css.replace(/#range-sections \.range-button:hover \{\r?\n[\s\S]*?\}\r?\n/g, '');

css = css.replace(/#mock-sections \.range-button \{\r?\n[\s\S]*?backwards;\r?\n\}/,
`#mock-sections .range-button {
  position: relative;
  padding: 15px 5px !important;
  border-radius: 20px !important;
  text-align: center;
  font-size: 0.9rem !important;
  font-weight: 800;
  line-height: 1.3;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--btn-bg) !important;
  color: var(--btn-color) !important;
  border: 2px dashed var(--btn-border) !important;
  box-shadow: 0 0 0 4px var(--btn-bg), 0 4px 0 4px var(--btn-border) !important;
  transition: transform 0.1s ease;
  animation: fadeInUp 0.4s ease-out backwards;
  margin: 4px;
}
#mock-sections .range-button::after {
  content: '🎀';
  position: absolute;
  top: -10px;
  right: -5px;
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}
`);
css = css.replace(/#mock-sections \.range-button:hover \{\r?\n[\s\S]*?\}\r?\n/g, '');
css = css.replace(/#mock-sections \.range-button:active \{\r?\n[\s\S]*?\}\r?\n/g, '');
css = css.replace(/#mock-sections \.range-button::before \{\r?\n[\s\S]*?\}\r?\n/g, '');
css = css.replace(/#mock-sections \.range-button::after \{\r?\n[\s\S]*?\}\r?\n/g, '');
css = css.replace(/#mock-sections \.range-button \{\r?\n\s+background-image: radial-gradient[\s\S]*?\}\r?\n/, '');

// Primary button (bảng xếp hạng)
css = css.replace(/\.primary-button \{\r?\n[\s\S]*?\}\r?\n/,
`.primary-button {
  background: #c38463 !important;
  border: none !important;
  outline: 3px dashed white;
  outline-offset: -6px;
  color: #ffffff !important;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 6px 0 #8c573c !important;
  border-radius: 16px !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  padding: 16px 20px;
}
`);

// Danger button (đăng xuất)
css = css.replace(/\.danger-button \{\r?\n[\s\S]*?\}\r?\n/,
`.danger-button {
  background: #ffc2d1 !important;
  color: #c93175 !important;
  border: none !important;
  box-shadow: 0 4px 0 #ff8fa3 !important;
  border-radius: 20px !important;
  padding: 12px 20px;
  font-weight: 800;
  position: relative;
  overflow: hidden;
}
.danger-button::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(rgba(255,255,255,0.4) 50%, transparent 50%);
  background-size: 100% 4px;
  pointer-events: none;
}
`);

fs.writeFileSync('styles.css', css);
console.log('done!');
