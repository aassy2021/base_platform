@echo off
title DeepSee-Backend
cd /d "%~dp0backend"
python main.py
echo.
echo [ERROR] Backend stopped unexpectedly.
echo Press any key to exit...
pause >nul
