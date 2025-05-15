const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to recursively empty a directory
function emptyDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory doesn't exist: ${dir}`);
    return;
  }

  try {
    // Get all files in the directory
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively empty the subdirectory
        emptyDirectory(filePath);
        // Remove the empty directory
        fs.rmdirSync(filePath);
        console.log(`Removed directory: ${filePath}`);
      } else {
        // Remove the file
        fs.unlinkSync(filePath);
        console.log(`Removed file: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Error emptying directory ${dir}:`, err);
  }
}

// Target the conflicting directory
const conflictDir = path.join('app', 'admin', 'articles', '[id]');
console.log(`Targeting conflict directory: ${conflictDir}`);

// Empty and remove the directory
emptyDirectory(conflictDir);

// Try to remove the now-empty directory
try {
  fs.rmdirSync(conflictDir);
  console.log(`Successfully removed directory: ${conflictDir}`);
} catch (err) {
  console.error(`Error removing directory ${conflictDir}:`, err);
}

console.log('Conflict resolution complete.'); 