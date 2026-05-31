const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The first `.coconut-char` is from earlier styles (line ~1592)
// The second is from the WOW styles (line ~1908)
// We need to replace all of them just in case, or use a global regex.
css = css.replace(/\.coconut-char\s*\{[\s\S]*?\}/g, 
`.coconut-char {
  background-image: url('assets/cute_coconut.png') !important;
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  width: 150px !important;
  height: 150px !important;
  top: -5px !important;
  left: 0px !important;
  mix-blend-mode: multiply !important;
}`);

fs.writeFileSync('styles.css', css);
