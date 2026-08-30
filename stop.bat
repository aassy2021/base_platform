@echo off
title DeepSeeHarness Stop

echo.
echo  ============================================
echo    DeepSeeHarness - Stop All Services
echo  ============================================
echo.

echo [1/3] Stopping DeepSee-Backend...
taskkill /FI "WINDOWTITLE eq DeepSee-Backend*" /F >nul 2>&1
if %errorlevel% equ 0 (
    echo        Stopped.
) else (
    echo        Process not found.
)

echo [2/3] Stopping DeepSee-Frontend...
taskkill /FI "WINDOWTITLE eq DeepSee-Frontend*" /F >nul 2>&1
if %errorlevel% equ 0 (
    echo        Stopped.
) else (
    echo        Process not found.
)

echo [3/3] Checking ports...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
        echo        Killed port 8080 PID=%%a
    )
) else (
    echo        Port 8080 is free.
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
        echo        Killed port 3000 PID=%%a
    )
) else (
    echo        Port 3000 is free.
)

echo.
echo  ============================================
echo    All services stopped.
echo  ============================================
echo.
echo  Press any key to exit...
pause >nul
exit /b 0
