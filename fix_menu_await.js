const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const menuJsPath = `${dir}/scripts/menu.js`;
  if (fs.existsSync(menuJsPath)) {
    let js = fs.readFileSync(menuJsPath, 'utf8');
    
    // Fix top level await by wrapping in IIFE
    if (js.includes('const progressRes = await apiRequest("/quiz/progress");')) {
      js = js.replace(
        'try {\n    const progressRes = await apiRequest("/quiz/progress");',
        '(async () => {\n  try {\n    const progressRes = await apiRequest("/quiz/progress");'
      );
      js = js.replace(
        '} catch(e) { console.error(e); }',
        '} catch(e) { console.error(e); }\n})();'
      );
      fs.writeFileSync(menuJsPath, js);
    }
  }
});
