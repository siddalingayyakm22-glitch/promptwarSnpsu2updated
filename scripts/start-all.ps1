# CyberShield AI — One-Click Full Stack Startup Script (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛡️  Starting CyberShield AI Full-Stack Platform..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python AI Microservice (Port 8000)
Write-Host "[1/3] Launching Python FastAPI Service on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../ai-service'; python -m uvicorn app.main:app --port 8000 --reload"

# 2. Start Node.js Backend (Port 5000)
Write-Host "[2/3] Launching Node.js Express Backend on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../backend'; npm start"

# 3. Start React Frontend (Port 5173)
Write-Host "[3/3] Launching Vite React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../frontend'; npm run dev"

Write-Host "`nAll 3 services launched in separate windows!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor Cyan
