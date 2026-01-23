# Requiere ejecucion como Administrador
#Requires -RunAsAdministrator

Write-Host "========================================================" -ForegroundColor Red
Write-Host "  LATCONECTA - Deteniendo todos los servicios" -ForegroundColor Red
Write-Host "========================================================" -ForegroundColor Red
Write-Host ""

# Funcion para detener procesos
function Stop-LatconectaProcess {
    param(
        [string]$Name,
        [int]$ProcessID
    )
    
    if ($ProcessID -gt 0) {
        Write-Host "Deteniendo $Name (PID: $ProcessID)..." -ForegroundColor Yellow -NoNewline
        
        $proc = Get-Process -Id $ProcessID -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $ProcessID -Force -ErrorAction SilentlyContinue
            Write-Host " OK" -ForegroundColor Green
            return $ProcessID
        }
        else {
            Write-Host " (ya detenido)" -ForegroundColor Gray
            return 0
        }
    }
    return 0
}

# Intentar cargar PIDs guardados
$pidsFile = "$env:TEMP\latconecta_pids.json"
$powershellPIDsToClose = @()

if (Test-Path $pidsFile) {
    Write-Host "Usando PIDs guardados..." -ForegroundColor Cyan
    Write-Host ""
    
    $pidsJson = Get-Content $pidsFile | ConvertFrom-Json
    
    # Detener procesos y guardar PIDs para cerrar ventanas
    $pid1 = Stop-LatconectaProcess -Name "Backend" -ProcessID $pidsJson.Backend
    $pid2 = Stop-LatconectaProcess -Name "Simulator" -ProcessID $pidsJson.Simulator
    $pid3 = Stop-LatconectaProcess -Name "Admin" -ProcessID $pidsJson.Admin
    $pid4 = Stop-LatconectaProcess -Name "Users" -ProcessID $pidsJson.Users
    
    if ($pid1 -gt 0) { $powershellPIDsToClose += $pid1 }
    if ($pid2 -gt 0) { $powershellPIDsToClose += $pid2 }
    if ($pid3 -gt 0) { $powershellPIDsToClose += $pid3 }
    if ($pid4 -gt 0) { $powershellPIDsToClose += $pid4 }
    
    Remove-Item $pidsFile -Force -ErrorAction SilentlyContinue
    Write-Host ""
}
else {
    Write-Host "No hay PIDs guardados, usando metodo alternativo..." -ForegroundColor Yellow
    Write-Host ""
}

# Metodo alternativo: Detener por nombre de proceso
Write-Host "Buscando procesos activos..." -ForegroundColor Cyan
Write-Host ""

# Python (Vendor Simulator)
$pythonProcs = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcs) {
    Write-Host "Deteniendo Python..." -ForegroundColor Yellow -NoNewline
    $pythonProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
}
else {
    Write-Host "Deteniendo Python... (no encontrado)" -ForegroundColor Gray
}

# Node (Frontends)
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "Deteniendo Node.js..." -ForegroundColor Yellow -NoNewline
    $nodeProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
}
else {
    Write-Host "Deteniendo Node.js... (no encontrado)" -ForegroundColor Gray
}

# Verificar puertos
Write-Host ""
Write-Host "Verificando puertos..." -ForegroundColor Cyan
Write-Host ""

$ports = @(8100, 5001, 5173, 5174)
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port.*LISTENING"
    
    if ($connections) {
        $line = $connections[0].ToString()
        $parts = $line -split '\s+'
        $portPID = $parts[-1]
        
        if ($portPID -match '^\d+$') {
            Write-Host "Puerto $port ocupado por PID $portPID..." -ForegroundColor Yellow -NoNewline
            Stop-Process -Id $portPID -Force -ErrorAction SilentlyContinue
            Write-Host " Liberado" -ForegroundColor Green
        }
    }
}

# Cerrar ventanas PowerShell de los servicios
Write-Host ""
Write-Host "Cerrando ventanas de servicios..." -ForegroundColor Cyan

$currentScriptPID = $PID
$closedCount = 0

# Obtener todas las ventanas PowerShell
$allPowerShells = Get-Process -Name "powershell" -ErrorAction SilentlyContinue

foreach ($ps in $allPowerShells) {
    # No cerrar la ventana actual del script
    if ($ps.Id -eq $currentScriptPID) {
        continue
    }
    
    # Si tenemos PIDs guardados, cerrar esas ventanas especificas
    if ($powershellPIDsToClose.Count -gt 0) {
        # Buscar ventanas PowerShell padre de los procesos de servicio
        # En Windows, cuando Start-Process crea una ventana, el PID devuelto es del proceso PowerShell
        if ($powershellPIDsToClose -contains $ps.Id) {
            Write-Host "Cerrando ventana de servicio (PID: $($ps.Id))" -ForegroundColor Gray
            Stop-Process -Id $ps.Id -Force -ErrorAction SilentlyContinue
            $closedCount++
        }
    }
    else {
        # Si no hay PIDs guardados, cerrar ventanas que ejecuten scripts temporales
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($ps.Id)" -ErrorAction SilentlyContinue).CommandLine
        
        if ($cmdLine -and $cmdLine -match "latconecta_.*\.ps1") {
            Write-Host "Cerrando ventana: $cmdLine" -ForegroundColor Gray
            Stop-Process -Id $ps.Id -Force -ErrorAction SilentlyContinue
            $closedCount++
        }
    }
}

if ($closedCount -gt 0) {
    Write-Host "Cerradas $closedCount ventana(s)" -ForegroundColor Green
}
else {
    Write-Host "No se encontraron ventanas de servicio para cerrar" -ForegroundColor Gray
}

# Limpiar archivos temporales
Write-Host ""
Write-Host "Limpiando archivos temporales..." -ForegroundColor Cyan

$tempFiles = Get-ChildItem "$env:TEMP\latconecta_*.ps1" -ErrorAction SilentlyContinue
if ($tempFiles) {
    $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Eliminados $($tempFiles.Count) archivo(s)" -ForegroundColor Gray
}
else {
    Write-Host "No hay archivos temporales" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  TODOS LOS SERVICIOS DETENIDOS" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Puedes reiniciar con: start_all.ps1" -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para cerrar"