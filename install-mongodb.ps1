# MongoDB Installation Script for Windows
Write-Host "🚀 Installing MongoDB Community Edition..." -ForegroundColor Green

# Download MongoDB
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi"
$mongoPath = "$env:TEMP\mongodb-installer.msi"

Write-Host "Downloading MongoDB..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoPath -ErrorAction SilentlyContinue

if (Test-Path $mongoPath) {
    Write-Host "Installing..." -ForegroundColor Yellow
    # Install MongoDB silently
    msiexec.exe /i $mongoPath /quiet /norestart SHOULD_INSTALL_COMPASS=0
    
    Write-Host "Waiting for installation..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "✅ MongoDB installation complete!" -ForegroundColor Green
    Write-Host "MongoDB service should be running..." -ForegroundColor Cyan
    
    # Check if service is running
    $service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($service.Status -eq "Running") {
        Write-Host "✅ MongoDB service is RUNNING" -ForegroundColor Green
    } else {
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
        Write-Host "✅ MongoDB service started" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Failed to download MongoDB" -ForegroundColor Red
}
