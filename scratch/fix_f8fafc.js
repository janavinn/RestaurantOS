const fs = require('fs');
let c = fs.readFileSync('frontend/src/index.css', 'utf-8');
c = c.replace(/background(-color)?:\s*#f8fafc;/g, 'background$1: #1f2330;');
fs.writeFileSync('frontend/src/index.css', c, 'utf-8');
console.log('Fixed f8fafc');
