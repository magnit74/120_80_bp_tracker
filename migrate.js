const fs = require('fs');
const path = require('path');

function migrate() {
  const src = __dirname;
  const dest = 'D:\\120_80_Dnevnik_davleniya';
  
  console.log('Copying files...');
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (srcPath) => {
      const name = path.basename(srcPath);
      if (['node_modules', '.expo', '.git', 'android', 'ios'].includes(name)) {
        return false;
      }
      return true;
    }
  });

  console.log('Updating app.json...');
  const appJsonPath = path.join(dest, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  appJson.expo.name = '120/80 Дневник давления';
  appJson.expo.slug = '120-80-dnevnik-davleniya';
  
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.package = 'com.health.bpdiary';
  
  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.bundleIdentifier = 'com.health.bpdiary';

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('Migration complete!');
}

migrate();
