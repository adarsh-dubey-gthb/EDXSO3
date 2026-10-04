@echo off
echo ========================================================
echo   Starting AI Interview Accelerator (FastAPI + React)
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Interview Accelerator - Backend" cmd /k ".\backend\venv\Scripts\python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "Interview Accelerator - Frontend" cmd /k "cd frontend && npx vite --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching!
echo Frontend: http://127.0.0.1:5173/
echo Backend:  http://127.0.0.1:8000/docs
echo ========================================================
pause
