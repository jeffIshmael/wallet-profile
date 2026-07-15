const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'src', 'app', 'docs');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir(docsDir, (filePath) => {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix missing commas before DocsAssistantDropdown
    content = content.replace(/([a-zA-Z0-9]+)\n\s+DocsAssistantDropdown,/g, "$1,\n  DocsAssistantDropdown,");
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log("Fixed missing commas in imports.");
