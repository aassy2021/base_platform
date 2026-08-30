@echo off
title DeepSee-Frontend
cd /d "%~dp0frontend"
npm run dev
echo.
echo [ERROR] Frontend stopped unexpectedly.
echo Press any key to exit...
pause >nul
