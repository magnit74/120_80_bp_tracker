const fs = require('fs');
let content = fs.readFileSync('src/navigation/AppNavigator.tsx', 'utf-8');
content = content.replace(/const PushPermissionScreen = \(\) => \{[\s\S]*?export const AppNavigator = \(\) => \{/, 'export const AppNavigator = () => {');
content = content.replace(/const pushStyles = StyleSheet\.create\(\{[\s\S]*\}\);\s*$/, '');
content = content.replace(/import { OfferDetailScreen } from '\.\.\/screens\/OfferDetailScreen';/, "import { OfferDetailScreen } from '../screens/OfferDetailScreen';\nimport PushPermissionScreen from '../screens/PushPermissionScreen';");
fs.writeFileSync('src/navigation/AppNavigator.tsx', content);
console.log('AppNavigator cleaned');
