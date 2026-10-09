# CyberShield AI — Retrain and Evaluate ML Models (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🧠 Training Machine Learning Models for URL & Message Fraud" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Push-Location "$PSScriptRoot/../ai-service"
python -m app.training.train_models
python -m app.evaluation.evaluate
Pop-Location

Write-Host "`n✅ Model training and evaluation finished!" -ForegroundColor Green
