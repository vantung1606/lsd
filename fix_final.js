const fs = require('fs');

const missingCode = `
/* RESTORING LOST CSS FROM MULTI_REPLACE FAIL */
#mock-sections .range-button::before {
  content: '🤎\\A 🤎\\A 🤎' !important;
  white-space: pre !important;
  position: absolute !important;
  left: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 0.55rem !important;
  line-height: 1.7 !important;
  color: #7a4b33 !important;
}
#mock-sections .range-button:active {
  transform: translateY(6px) !important;
  box-shadow: 0 0px 0 var(--btn-border), 0 2px 5px rgba(0,0,0,0.05) !important;
}
#mock-sections .range-button::after {
  content: '🎀' !important;
  position: absolute !important;
  top: -12px !important;
  right: -6px !important;
  font-size: 1.4rem !important;
  filter: drop-shadow(0 3px 3px rgba(0,0,0,0.15)) !important;
}
`;

fs.appendFileSync('e:/lsd/lsd/frontend/styles.css', missingCode);
fs.appendFileSync('e:/lsd/lsd/backend/public/styles.css', missingCode);

// Kill process on port 3000
const { execSync } = require('child_process');
try {
  execSync('powershell.exe -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force"');
} catch (e) {
  // Ignore error if process not found
}
