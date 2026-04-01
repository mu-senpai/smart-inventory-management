const fs = require('fs');
const path = require('path');

function processDir(dir, depth, isTest = false) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath, depth + 1, isTest);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      let replacement = '';
      if (isTest) {
        replacement = '../'.repeat(depth) + 'src/';
      } else {
        replacement = depth === 0 ? './' : '../'.repeat(depth);
      }

      const newContent = content.replace(/@\//g, replacement);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir(path.join(process.cwd(), 'src'), 0);
processDir(path.join(process.cwd(), 'tests'), 1, true);
