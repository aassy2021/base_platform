@echo off
title DeepSeeHarness
echo.
echo  ============================================
echo    DeepSeeHarness Base Platform - Start
echo  ============================================
echo.
cd /d "%~dp0"
echo [INFO] Work Dir: %CD%
echo.
rem ---- Check Python ----
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python 3.8+
    echo         https://www.python.org/downloads/
    echo.
    goto :fail
)
python --version
rem ---- Check Node.js ----
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js 16+
    echo         https://nodejs.org/
    echo.
    goto :fail
)
node --version
rem ---- Install backend deps ----
echo.
echo [3/4] Installing backend dependencies...
pip install -r requirements.txt -q 2>nul
if %errorlevel% neq 0 (
    echo [WARN] Some deps failed, continuing...
) else (
    echo        Done.
)
rem ---- Install frontend deps ----
echo [4/4] Installing frontend dependencies...
if not exist "frontend\node_modules" (
    pushd frontend
    call npm install --silent 2>nul
    popd
    echo        Done.
) else (
    echo        node_modules exists, skipped.
)
rem ---- Start backend ----
echo.
echo [START] Backend (port 8080)...
start "" "%~dp0start_backend.bat"
rem ---- Start frontend ----
echo [START] Frontend (port 3000)...
start "" "%~dp0start_frontend.bat"
echo.
echo  ============================================
echo    All services started.
echo    Frontend: http://localhost:3000
 echo    Backend : http://localhost:8080
echo  ============================================
echo.
echo  Press any key to close this window...
pause >nul
exit /b 0

:fail
echo.
echo  Startup failed. Please install missing dependencies.
echo  Press any key to exit...
pause >nul
exit /b 1
