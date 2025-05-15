const fs = require('fs');
const path = require('path');

function findDynamicRoutes(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file.startsWith('[') && file.endsWith(']')) {
        results.push({
          path: filePath,
          name: file
        });
      }
      findDynamicRoutes(filePath, results);
    }
  }
  
  return results;
}

const results = findDynamicRoutes('app');
console.log('Found dynamic routes:');
results.forEach(route => {
  console.log(`${route.name}: ${route.path}`);
}); 