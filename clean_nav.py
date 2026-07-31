import os

filepath = 'src/navigation/AppNavigator.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
import_added = False

for line in lines:
    if line.startswith('import { OfferDetailScreen }'):
        new_lines.append(line)
        if not import_added:
            new_lines.append("import PushPermissionScreen from '../screens/PushPermissionScreen';\n")
            import_added = True
        continue
        
    if 'const PushPermissionScreen = () => {' in line:
        skip = True
        continue
        
    if 'export const AppNavigator = () => {' in line:
        skip = False
        new_lines.append(line)
        continue
        
    if 'const pushStyles = StyleSheet.create({' in line:
        skip = True
        continue
        
    if not skip:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Cleaned AppNavigator.tsx")
