const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'src', 'app', 'docs');
const outputDir = path.join(__dirname, '..', 'public', 'docs-md');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(docsDir, (filePath) => {
  if (filePath.endsWith('page.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Naive JSX to Markdown conversion
    let md = content
      .replace(/<DocsH2[^>]*>(.*?)<\/DocsH2>/g, '## $1')
      .replace(/<DocsH3[^>]*>(.*?)<\/DocsH3>/g, '### $1')
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<li[^>]*>/g, '- ')
      .replace(/<\/li>/g, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
      .replace(/<DocsCode>(.*?)<\/DocsCode>/gs, '```\n$1\n```')
      .replace(/<[^>]+>/g, '') // Strip remaining tags
      .replace(/\\{" "\\}/g, ' ')
      .replace(/&nbsp;/g, ' ');

    // Cleanup extra whitespace
    md = md.replace(/\n{3,}/g, '\n\n').trim();

    // Determine name
    const rel = path.relative(docsDir, filePath);
    const parts = rel.split(path.sep);
    let name = parts.length > 1 ? parts[parts.length - 2] : 'index';
    
    fs.writeFileSync(path.join(outputDir, `${name}.md`), md);
    console.log(`Generated ${name}.md`);
  }
});
