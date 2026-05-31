const fs = require('fs');

const dirs = ['e:/lsd/lsd/frontend', 'e:/lsd/lsd/backend/public'];

dirs.forEach(dir => {
  // 1. Add CSS to styles.css
  const cssPath = `${dir}/styles.css`;
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('.floating-image-bubble')) {
      css += `\n
.floating-images-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.floating-image-bubble {
  position: absolute;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  animation: floatUpImage ease-in forwards;
  opacity: 0;
}

@keyframes floatUpImage {
  0% {
    transform: translateY(0) translateX(0) scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-110vh) translateX(var(--sway)) scale(1.2) rotate(10deg);
    opacity: 0;
  }
}`;
      fs.writeFileSync(cssPath, css);
    }
  }

  // 2. Add animation logic to quiz.js
  const quizJsPath = `${dir}/scripts/quiz.js`;
  if (fs.existsSync(quizJsPath)) {
    let js = fs.readFileSync(quizJsPath, 'utf8');
    
    if (!js.includes('createFloatingImages')) {
      const helperFunction = `\n
function createFloatingImages(type) {
  const container = document.createElement('div');
  container.className = 'floating-images-container';
  document.body.appendChild(container);
  
  const imgSrc = type === 'happy' ? './assets/happy.png' : './assets/sad.png';
  const numImages = 15; // 1 đống ảnh
  
  for (let i = 0; i < numImages; i++) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = 'floating-image-bubble';
    
    const size = Math.random() * 50 + 50; // 50px - 100px
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.style.left = (Math.random() * 90) + 'vw';
    img.style.bottom = '-120px';
    
    img.style.animationDuration = (Math.random() * 2 + 2) + 's';
    img.style.animationDelay = (Math.random() * 0.3) + 's';
    
    const sway = (Math.random() - 0.5) * 150;
    img.style.setProperty('--sway', sway + 'px');
    
    container.appendChild(img);
  }
  
  setTimeout(() => container.remove(), 5000);
}
`;
      
      js += helperFunction;
      
      // Inject into handleOptionClick
      js = js.replace(
        'sounds.playCorrect();',
        'sounds.playCorrect();\n    createFloatingImages("happy");'
      );
      js = js.replace(
        'sounds.playWrong();',
        'sounds.playWrong();\n    createFloatingImages("sad");'
      );
      
      fs.writeFileSync(quizJsPath, js);
    }
  }
});
