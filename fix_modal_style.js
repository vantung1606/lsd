const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  const menuHtmlPath = `${dir}/menu.html`;
  if (fs.existsSync(menuHtmlPath)) {
    let html = fs.readFileSync(menuHtmlPath, 'utf8');
    
    // Replace ugly modal buttons
    html = html.replace(
      '<button id="btn-sequential" class="primary-button" style="padding: 10px 15px; font-size: 0.9rem;">Theo thứ tự</button>',
      '<button id="btn-sequential" class="modal-btn-seq">Theo thứ tự</button>'
    );
    html = html.replace(
      '<button id="btn-random" class="secondary-button" style="padding: 10px 15px; font-size: 0.9rem;">Lộn xộn</button>',
      '<button id="btn-random" class="modal-btn-rand">Lộn xộn 🔀</button>'
    );
    
    fs.writeFileSync(menuHtmlPath, html);
  }

  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    
    if (!css.includes('.modal-btn-seq')) {
      css += `\n
.modal-btn-seq {
  background: #e6f2ff;
  color: #004d99;
  border: 2px solid #4da6ff;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #4da6ff;
  transition: all 0.1s ease;
  flex: 1;
}
.modal-btn-seq:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #4da6ff;
}

.modal-btn-rand {
  background: #ffe8ee;
  color: #8c1d34;
  border: 2px solid #ff6b8b;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #ff6b8b;
  transition: all 0.1s ease;
  flex: 1;
}
.modal-btn-rand:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 #ff6b8b;
}`;
      fs.writeFileSync(cssPath, css);
    }
  }
});
