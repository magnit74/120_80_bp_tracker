$fso = New-Object -ComObject Scripting.FileSystemObject
$folders = @(
    "C:\Users\оператор\Downloads",
    "C:\Users\оператор\AppData\Local\Temp",
    "C:\Users\оператор\AppData\Local\npm-cache",
    "C:\Users\оператор\.gradle",
    "C:\Users\оператор\.npm",
    "C:\Users\оператор\.android",
    "C:\Windows\Temp"
)

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        try {
            $f = $fso.GetFolder($folder)
            $size = [math]::Round($f.Size / 1MB, 2)
            Write-Host "$folder : $size MB"
        } catch {
            Write-Host "$folder : Access Denied or Error"
        }
    }
}
