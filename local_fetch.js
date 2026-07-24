const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const tar = require('tar');

const url = 'https://registry.npmjs.org/expo-template-bare-minimum/-/expo-template-bare-minimum-55.0.38.tgz';
const destFolder = 'D:\ANDROID_WORK\PROJECTS\120_80_BP_Treter';
const tarballPath = path.join(destFolder, 'template.tgz');

https.get(url, (res) => {
    const file = fs.createWriteStream(tarballPath);
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Downloaded template. Extracting android folder...');
        
        fs.createReadStream(tarballPath)
            .pipe(zlib.createGunzip())
            .pipe(tar.x({
                cwd: destFolder,
                filter: (path) => path.startsWith('package/android/')
            }))
            .on('end', () => {
                // Rename extracted 'package/android' to 'android'
                const packageAndroidPath = path.join(destFolder, 'package', 'android');
                const targetAndroidPath = path.join(destFolder, 'android');
                
                if (fs.existsSync(packageAndroidPath)) {
                    // Create android dir if not exists
                    if (!fs.existsSync(targetAndroidPath)) {
                        fs.renameSync(packageAndroidPath, targetAndroidPath);
                    }
                    console.log('Android folder successfully placed!');
                } else {
                    console.error('Failed to extract android folder');
                }
            })
            .on('error', (err) => {
                console.error('Extraction error:', err);
            });
    });
}).on('error', (err) => {
    console.error('Download error:', err);
});
