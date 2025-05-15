const fs = require('fs');
const path = require('path');

// Create a new directory structure
console.log('Creating new directory structure...');

// 1. Fix admin routes
if (fs.existsSync(path.join('app', 'admin', 'articles', '[id]'))) {
  console.log('Moving admin/articles/[id] to admin/article/[id]');
  
  // Create new directory
  fs.mkdirSync(path.join('app', 'admin', 'article', '[id]'), { recursive: true });
  
  // Copy files from old to new location
  try {
    const files = fs.readdirSync(path.join('app', 'admin', 'articles', '[id]'));
    for (const file of files) {
      const content = fs.readFileSync(path.join('app', 'admin', 'articles', '[id]', file));
      fs.writeFileSync(path.join('app', 'admin', 'article', '[id]', file), content);
    }
    console.log('  Files copied successfully');
    
    // Remove old directory
    fs.rmSync(path.join('app', 'admin', 'articles', '[id]'), { recursive: true, force: true });
    console.log('  Old directory removed');
  } catch (err) {
    console.log('  Error:', err.message);
  }
}

// 2. Fix API routes
// First, remove the backup directory completely
if (fs.existsSync(path.join('app', 'api', 'articles-backup'))) {
  console.log('Removing articles-backup directory');
  fs.rmSync(path.join('app', 'api', 'articles-backup'), { recursive: true, force: true });
}

// Ensure we don't have [id] in articles directory
if (fs.existsSync(path.join('app', 'api', 'articles', '[id]'))) {
  console.log('Removing api/articles/[id] directory');
  fs.rmSync(path.join('app', 'api', 'articles', '[id]'), { recursive: true, force: true });
}

console.log('Route fixing complete. Please restart the development server.'); 