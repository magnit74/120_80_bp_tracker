const fs = require('fs');
const path = require('path');

const appJsonPath = 'D:\\ANDROID_WORK\\PROJECTS\\120_80_Dnevnik_davleniya\\app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Set the display name (shows on phone home screen)
appJson.expo.name = '120/80 Дневник давления';
appJson.expo.slug = 'bp-diary-120-80';

// Configure Android
if (!appJson.expo.android) appJson.expo.android = {};
appJson.expo.android.package = 'com.health.bpdiary12080';

// Configure iOS (just in case)
if (!appJson.expo.ios) appJson.expo.ios = {};
appJson.expo.ios.bundleIdentifier = 'com.health.bpdiary12080';

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('App configured successfully!');
