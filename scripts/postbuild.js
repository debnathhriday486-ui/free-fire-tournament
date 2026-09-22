import fs from 'fs';
import path from 'path';

const docsIndexPath = path.resolve('docs/index.html');
const docs404Path = path.resolve('docs/404.html');
const docsNoJekyllPath = path.resolve('docs/.nojekyll');

if (fs.existsSync(docsIndexPath)) {
  let content = fs.readFileSync(docsIndexPath, 'utf-8');
  // Remove the redirect block from docs/index.html
  const regex = /<!-- GITHUB_PAGES_ROOT_REDIRECT_START -->[\s\S]*?<!-- GITHUB_PAGES_ROOT_REDIRECT_END -->/g;
  content = content.replace(regex, '');
  fs.writeFileSync(docsIndexPath, content, 'utf-8');
  console.log('Cleaned docs/index.html');

  // Copy to 404.html for SPA client-side routing
  fs.writeFileSync(docs404Path, content, 'utf-8');
  console.log('Created docs/404.html');
}

// Write .nojekyll in docs
fs.writeFileSync(docsNoJekyllPath, '', 'utf-8');
console.log('Created docs/.nojekyll');
