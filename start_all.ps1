# Requiere ejecucion como Administrador
#Requires -RunAsAdministrator

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  LATCONECTA - Iniciando todos los servicios" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_PATH = "C:\Users\Usuario\dev\latconecta_full_entorno"

# Funcion para iniciar servicio
function Start-LatconectaService {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "Iniciando $Name..." -ForegroundColor Green
    
    $scriptPath = "$env:TEMP\latconecta_$Name.ps1"
    
    $scriptContent = @"
Set-Location '$Path'
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ' $Name - INICIADO' -ForegroundColor Green
Write-Host '=======================================' -ForegroundColor Cyan
Write-Host ''
$Command
"@
    
    $scriptContent | Out-File -FilePath $scriptPath -Encoding UTF8 -Force
    
    $proc = Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $scriptPath -PassThru
    
    return $proc
}

# Iniciar servicios
Write-Host "1. Backend (FastAPI)" -ForegroundColor Yellow
$backend = Start-LatconectaService -Name "Backend" -Path "$BASE_PATH\backend" -Command ".\.venv\Scripts\activate; uvicorn app.main:app --reload --port 8100"
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "2. Vendor Simulator" -ForegroundColor Yellow
$simulator = Start-LatconectaService -Name "Simulator" -Path "$BASE_PATH\vendor_simulator" -Command "python vendor_simulator.py"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "3. Admin Frontend" -ForegroundColor Yellow
$admin = Start-LatconectaService -Name "Admin" -Path "$BASE_PATH\latconecta_admin" -Command "npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "4. Users Frontend" -ForegroundColor Yellow
$users = Start-LatconectaService -Name "Users" -Path "$BASE_PATH\latconecta_users" -Command "npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  TODOS LOS SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Write-Host "URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   Backend API:        http://localhost:8100/docs" -ForegroundColor Yellow
Write-Host "   Vendor Simulator:   http://localhost:5001/health" -ForegroundColor Yellow
Write-Host "   Admin Portal:       http://localhost:5174" -ForegroundColor Yellow
Write-Host "   Users Portal:       http://localhost:5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "Esperando 30 segundos..." -ForegroundColor Yellow
for ($i = 30; $i -gt 0; $i--) {
    Write-Host "Tiempo restante: $i segundos" -NoNewline
    Start-Sleep -Seconds 1
    Write-Host "`r" -NoNewline
}

Write-Host ""
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SISTEMA LISTO" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Guardar PIDs
$pids = @{
    Backend = $backend.Id
    Simulator = $simulator.Id
    Admin = $admin.Id
    Users = $users.Id
}
$pids | ConvertTo-Json | Out-File "$env:TEMP\latconecta_pids.json" -Force

Write-Host "Para DETENER servicios, ejecuta: stop_all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para salir (los servicios seguiran corriendo)" -ForegroundColor Gray
Write-Host ""

# Mantener script vivo
$running = $true
while ($running) {
    try {
        Start-Sleep -Seconds 5
    }
    catch {
        $running = $false
    }
}