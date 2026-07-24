$before = (Get-PSDrive -Name C).Free
Write-Host "Before:$([math]::Round($before/1GB,2))GB"

# Clean user temp
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null

# Clean Windows temp
$winTemp = "$env:SystemRoot\Temp"
Remove-Item -Path "$winTemp\*" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $winTemp -Force | Out-Null

# Clean Windows Update download cache
Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service -Name wuauserv -ErrorAction SilentlyContinue

# WinSxS cleanup
Dism.exe /Online /Cleanup-Image /StartComponentCleanup

$after = (Get-PSDrive -Name C).Free
Write-Host "After:$([math]::Round($after/1GB,2))GB"
$freed = $after - $before
Write-Host "Freed:$([math]::Round($freed/1GB,2))GB"
