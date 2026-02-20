# ============================================================
# LATCONECTA - Iniciar todos los entornos
# ============================================================

$BASE = "C:\Users\Usuario\dev\latconecta_full_entorno"

# Backend (Puerto 8100)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8100" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# Vendor Simulator (Puerto 5001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\vendor_simulator'; python vendor_simulator.py" `
    -WindowStyle Normal

Start-Sleep -Seconds 1

# Users Frontend (Puerto 5174)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\latconecta_users'; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 1

# Admin Frontend (Puerto 5173)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\latconecta_admin'; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 1

# Izipay Sandbox (Puerto 5175)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$BASE\izipay-sandbox'; npm run dev -- --port 5175" `
    -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LATCONECTA - Entornos iniciando..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Backend:          http://127.0.0.1:8100" -ForegroundColor Green
Write-Host "  Vendor Simulator: http://127.0.0.1:5001" -ForegroundColor Green
Write-Host "  Users Frontend:   http://127.0.0.1:5174" -ForegroundColor Green
Write-Host "  Admin Frontend:   http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "  Izipay Sandbox:   http://127.0.0.1:5175" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan