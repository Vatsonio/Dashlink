@echo off
title Dashlink Dev

echo Starting backend...
start "Dashlink Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting frontend...
start "Dashlink Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the opened windows to stop.
