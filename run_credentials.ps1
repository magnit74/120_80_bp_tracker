$env:EXPO_TOKEN = 't2dbPCI5tqxiUgbyBBO8VxI9Fadl5C-36mrkpaI_'
Set-Location 'D:\projects\120_80_BP_Treter'

$input = @"
1
2
A.Shikhovtsev@icloud.com
ovus-uhqa-tfat-eagg
"@

$input | node 'C:\Users\Александр\AppData\Roaming\npm\node_modules\eas-cli\bin\run' credentials --platform ios 2>&1
