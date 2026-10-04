Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting AI Interview Accelerator (FastAPI + React)  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Start FastAPI Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\venv\Scripts\python -m uvicorn main:app --app-dir . --host 127.0.0.1 --port 8000 --reload"

# Start React Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npx vite --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "Both servers launched successfully!" -ForegroundColor Green
Write-Host "Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Web App UI:   http://127.0.0.1:5173/" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
