const fs = require('fs');
const path = require('path');

const appJsonPath = 'D:\\ANDROID_WORK\\PROJECTS\\BloodPressureDiary\\app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// The app name displayed on the Android home screen below the icon
appJson.expo.name = '120/80 Дневник давления';

// The project internal slug (lowercase, no spaces)
appJson.expo.slug = 'blood-pressure-diary';

// Android package name (standard reverse-domain format)
if (!appJson.expo.android) appJson.expo.android = {};
appJson.expo.android.package = 'ru.health.bloodpressure';

// iOS bundle identifier
if (!appJson.expo.ios) appJson.expo.ios = {};
appJson.expo.ios.bundleIdentifier = 'ru.health.bloodpressure';

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('App configured with professional names successfully!');
