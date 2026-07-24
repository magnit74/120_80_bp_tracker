const fs = require('fs');
const path = require('path');

function getDirSize(dirPath) {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isSymbolicLink()) continue;
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                size += getDirSize(fullPath);
            } else {
                size += fs.statSync(fullPath).size;
            }
        }
    } catch (e) {
        // Ignore access denied
    }
    return size;
}

const targetDir = 'C:\\Users\\оператор';
const results = [];

try {
    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    console.log('Scanning ' + targetDir + '...');
    
    // Also add some known heavy hidden dirs manually
    const knownCaches = [
        path.join(targetDir, 'AppData', 'Local', 'Temp'),
        path.join(targetDir, 'AppData', 'Local', 'npm-cache'),
        path.join(targetDir, '.gradle'),
        path.join(targetDir, '.npm'),
        path.join(targetDir, '.android'),
        path.join(targetDir, '.gemini')
    ];
    
    for (const item of items) {
        if (item.isDirectory() && item.name !== 'AppData') {
            const fullPath = path.join(targetDir, item.name);
            const size = getDirSize(fullPath);
            results.push({ name: item.name, size: size });
        }
    }
    
    for (const cache of knownCaches) {
        if (fs.existsSync(cache)) {
            const size = getDirSize(cache);
            results.push({ name: cache.replace(targetDir + '\\', ''), size: size });
        }
    }

    results.sort((a, b) => b.size - a.size);

    console.log('\nLargest directories in ' + targetDir + ':');
    for (let i = 0; i < Math.min(15, results.length); i++) {
        const sizeMB = (results[i].size / (1024 * 1024)).toFixed(2);
        console.log(`${results[i].name.padEnd(40)} ${sizeMB.padStart(10)} MB`);
    }
} catch (e) {
    console.error(e);
}
