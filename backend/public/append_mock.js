const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css += `
#mock-sections .range-button::before {
  content: '🤎\\A🤎\\A🤎';
  white-space: pre;
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6rem;
  line-height: 1.5;
}
`;

fs.writeFileSync('styles.css', css);
