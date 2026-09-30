@echo off
title LeakLens Frontend
cd /d "%~dp0"
echo.
echo   Starting LeakLens frontend...
echo   A browser window will open at http://localhost:5173
echo   Keep this window open while using the app. Close it to stop the app.
echo.
start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:5173"
npm run dev
