$before = (Get-PSDrive -Name C).Free
Write-Host "Before cleanup: $([math]::Round($before/1GB,2)) GB"

# 1. Prefetch folder
$prefetch = "$env:SystemRoot\Prefetch"
if (Test-Path $prefetch) {
    Remove-Item -Path "$prefetch\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Prefetch cleared"
}

# 2. Recycle Bin (empty for all users)
Get-ChildItem -Path "C:\$Recycle.Bin" -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Recycle Bin emptied"

# 3. ThumbCache
$thumbCache = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
if (Test-Path $thumbCache) {
    Get-ChildItem -Path $thumbCache -Filter "thumbcache_*.db" -Force | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "ThumbCache cleared"
}

# 4. Old files in Downloads (> 180 days)
$downloads = "$env:USERPROFILE\Downloads"
if (Test-Path $downloads) {
    Get-ChildItem -Path $downloads -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-180) } |
        Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Old downloads removed"
}

# 5. npm cache older than 90 days
$npmCache = "$env:USERPROFILE\AppData\Local\npm-cache"
if (Test-Path $npmCache) {
    Get-ChildItem -Path $npmCache -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) } |
        Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Old npm cache files removed"
}

# 6. Gradle caches older than 180 days (except current)
$gradleCache = "$env:USERPROFILE\.gradle\caches"
if (Test-Path $gradleCache) {
    Get-ChildItem -Path $gradleCache -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-180) } |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Old Gradle caches removed"
}

# 7. Windows Update temporary files (already cleared, but repeat safe)
$wuTemp = "$env:SystemRoot\SoftwareDistribution\Download"
if (Test-Path $wuTemp) {
    Remove-Item -Path "$wuTemp\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Windows Update download cache cleared"
}

# 8. Log files older than 60 days in Windows\Logs
$winLogs = "$env:SystemRoot\Logs"
if (Test-Path $winLogs) {
    Get-ChildItem -Path $winLogs -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-60) } |
        Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Old Windows log files removed"
}

# 9. Temporary files in AppData\Local\Temp (again safe)
$localTemp = "$env:LOCALAPPDATA\Temp"
if (Test-Path $localTemp) {
    Remove-Item -Path "$localTemp\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Local Temp cleared"
}

$after = (Get-PSDrive -Name C).Free
Write-Host "After cleanup: $([math]::Round($after/1GB,2)) GB"
$freed = $after - $before
Write-Host "Total freed: $([math]::Round($freed/1GB,2)) GB"
