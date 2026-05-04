@echo off
echo ========================================
echo  Food Rescue Platform - Backend Setup
echo ========================================

cd /d "%~dp0"

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (echo ERROR: Python not found. Install Python 3.11+ & exit /b 1)

echo [2/4] Activating venv and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/4] Setup complete!
echo [4/4] Starting server on http://localhost:8000
echo        API docs at http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
