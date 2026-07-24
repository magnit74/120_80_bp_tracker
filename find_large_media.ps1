$reportPath = "C:\Users\оператор\Documents\antigravity\elegant-bose\large_files_report.txt"

# Remove old report if exists
if (Test-Path $reportPath) { Remove-Item -Path $reportPath -Force }

$extensions = @('*.mp4','*.mkv','*.avi','*.mov','*.wmv','*.jpg','*.jpeg','*.png','*.gif','*.bmp','*.exe','*.iso','*.zip','*.rar','*.7z')

Get-ChildItem -Path C:\ -Recurse -Include $extensions -File -ErrorAction SilentlyContinue |
    Where-Object {$_.Length -gt 200MB} |
    Sort-Object Length -Descending |
    ForEach-Object {
        $sizeGB = [math]::Round($_.Length / 1GB, 2)
        "$($_.FullName) | $sizeGB GB" | Out-File -FilePath $reportPath -Append
    }

Write-Host "Report generated at $reportPath"
