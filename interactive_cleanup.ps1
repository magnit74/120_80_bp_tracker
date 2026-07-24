$reportPath = "$env:USERPROFILE\Documents\antigravity\elegant-bose\large_files_report.txt"
$logPath = "$env:USERPROFILE\Documents\antigravity\elegant-bose\cleanup_log.txt"

# Ensure log file exists
if (Test-Path $logPath) { Remove-Item -Path $logPath -Force }
New-Item -ItemType File -Path $logPath -Force | Out-Null

# Read report lines
if (-not (Test-Path $reportPath)) {
    Write-Host "Report file not found at $reportPath. Run find_large_media.ps1 first."
    exit 1
}

$lines = Get-Content -Path $reportPath
if ($lines.Count -eq 0) {
    Write-Host "No large files found in the report. Nothing to clean."
    exit 0
}

foreach ($line in $lines) {
    # Expected format: FullPath | SizeGB
    $parts = $line -split '\s*\|\s*'
    $fullPath = $parts[0]
    $size = $parts[1]

    if (-not (Test-Path $fullPath)) {
        "[SKIPPED] File not found: $fullPath" | Out-File -FilePath $logPath -Append
        continue
    }

    Write-Host "File: $fullPath"
    Write-Host "Size: $size"
    $answer = Read-Host "Delete this file? (y/N)"
    if ($answer -eq 'y' -or $answer -eq 'Y') {
        try {
            Remove-Item -Path $fullPath -Force
            "[DELETED] $fullPath | $size" | Out-File -FilePath $logPath -Append
            Write-Host "Deleted."
        } catch {
            "[ERROR] Failed to delete $fullPath : $_" | Out-File -FilePath $logPath -Append
            Write-Host "Error deleting file."
        }
    } else {
        "[KEPT] $fullPath | $size" | Out-File -FilePath $logPath -Append
        Write-Host "Kept."
    }
    Write-Host "---"
}

Write-Host "Cleanup finished. Log written to $logPath"
