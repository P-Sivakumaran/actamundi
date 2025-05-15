const fs = require('fs');
const path = require('path');

function findDynamicRoutes(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file.startsWith('[') && file.endsWith(']')) {
        // Verify the directory actually exists
        const exists = fs.existsSync(filePath);
        if (exists) {
          results.push({
            path: filePath,
            name: file,
            exists: exists
          });
        } else {
          console.log(`Path reported but does not exist: ${filePath}`);
        }
      }
      findDynamicRoutes(filePath, results);
    }
  }
  
  return results;
}

const results = findDynamicRoutes('app');
console.log('Found dynamic routes:');
results.forEach(route => {
  console.log(`${route.name}: ${route.path} (Exists: ${route.exists})`);
});

// Group routes by parent directory to identify conflicts
const routesByDir = {};
results.forEach(route => {
  const parentDir = path.dirname(route.path);
  if (!routesByDir[parentDir]) {
    routesByDir[parentDir] = [];
  }
  routesByDir[parentDir].push(route.name);
});

console.log('\nPotential conflicts (same parent with different dynamic route names):');
for (const [dir, routes] of Object.entries(routesByDir)) {
  if (routes.length > 1 && new Set(routes).size > 1) {
    console.log(`${dir}: ${routes.join(', ')}`);
  }
} 