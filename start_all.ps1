# ============================================================
# LATCONECTA - Script de Inicio de Todos los Servicios
# ============================================================
# Servicios:
#   1. Backend API        → http://localhost:8100
#   2. Vendor Simulator   → http://localhost:5001
#   3. Frontend Admin     → http://localhost:5173
#   4. Frontend Users     → http://localhost:5174
#   5. Izipay Sandbox     → http://localhost:5175
# ============================================================

$BASE = "C:\Users\Usuario\dev\latconecta_full_entorno"

Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   LATCONECTA - Iniciando todos los servicios" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. BACKEND
Write-Host "[1/5] Backend API (puerto 8100)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8100"
Start-Sleep -Seconds 6

# 2. VENDOR SIMULATOR
Write-Host "[2/5] Vendor Simulator (puerto 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\vendor_simulator'; ..\backend\.venv\Scripts\Activate.ps1; python vendor_simulator.py"
Start-Sleep -Seconds 3

# 3. FRONTEND ADMIN
Write-Host "[3/5] Frontend Admin (puerto 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\latconecta_admin'; npm run dev"
Start-Sleep -Seconds 5

# 4. FRONTEND USERS
Write-Host "[4/5] Frontend Users (puerto 5174)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\latconecta_users'; npm run dev"
Start-Sleep -Seconds 5

# 5. IZIPAY SANDBOX
Write-Host "[5/5] Izipay Sandbox (puerto 5175)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\izipay-sandbox'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   TODOS LOS SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API    : http://localhost:8100/docs" -ForegroundColor White
Write-Host "  Vendor Sim     : http://localhost:5001/health" -ForegroundColor White
Write-Host "  Admin Panel    : http://localhost:5173" -ForegroundColor White
Write-Host "  Users App      : http://localhost:5174" -ForegroundColor White
Write-Host "  Izipay Sandbox : http://localhost:5175" -ForegroundColor White
Write-Host ""
Write-Host "  Para detener: cierra cada ventana o ejecuta stop_all.ps1" -ForegroundColor Gray
Write-Host ""