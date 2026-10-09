# CyberShield AI — Run All Test Suites (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🧪 Running Automated Tests: Backend & AI Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run Python pytest suite
Write-Host "`n[1/2] Running Python Pytest Suite..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/../ai-service"
python -m pytest app/tests
Pop-Location

# 2. Run Node.js backend integration suite
Write-Host "`n[2/2] Running Node.js Supertest & Integration Suite..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/../backend"
npm test
Pop-Location

Write-Host "`n✅ All test suites finished!" -ForegroundColor Green
