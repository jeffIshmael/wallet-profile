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

    // Make sure DocsAssistantDropdown is imported
    if (!content.includes('DocsAssistantDropdown')) {
      content = content.replace(
        /\} from "@\/components\/docs\/DocsContent";/,
        `  DocsAssistantDropdown,\n} from "@/components/docs/DocsContent";`
      );
    }

    // Replace the h1 with the flex container, if it hasn't been replaced yet
    if (!content.includes('<DocsAssistantDropdown />')) {
      content = content.replace(
        /<h1 className="docs-title">(.*?)<\/h1>/,
        `<div className="flex items-center justify-between gap-4 mb-4">\n        <h1 className="docs-title !mb-0">$1</h1>\n        <DocsAssistantDropdown />\n      </div>`
      );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
