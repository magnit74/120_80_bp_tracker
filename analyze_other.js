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
        // ignore access errors
    }
    return size;
}

const foldersToScan = [
    'C:\\Users\\оператор\\AppData\\Local',
    'C:\\Users\\оператор\\AppData\\Roaming',
    'C:\\Users\\оператор\\AppData\\LocalLow',
    'C:\\Users\\оператор'
];

let results = [];

for (const baseDir of foldersToScan) {
    try {
        if (!fs.existsSync(baseDir)) continue;
        const items = fs.readdirSync(baseDir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory() && item.name !== 'AppData') { // skip recursive AppData in user root
                const fullPath = path.join(baseDir, item.name);
                const size = getDirSize(fullPath);
                if (size > 100 * 1024 * 1024) { // only > 100MB
                    results.push({ path: fullPath, size: size });
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// deduplicate overlapping paths if we scanned root and local
const uniqueResults = [];
const seenPaths = new Set();
for (const res of results) {
    if (!seenPaths.has(res.path)) {
        seenPaths.add(res.path);
        uniqueResults.push(res);
    }
}

uniqueResults.sort((a, b) => b.size - a.size);

console.log("TOP LARGE FOLDERS IN USER DIRECTORY (The 'Other' category):");
for (let i = 0; i < Math.min(20, uniqueResults.length); i++) {
    const sizeGB = (uniqueResults[i].size / (1024 * 1024 * 1024)).toFixed(2);
    console.log(`${sizeGB.padStart(6)} GB | ${uniqueResults[i].path}`);
}
