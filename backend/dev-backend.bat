@echo off
REM Navigate to backend directory (optional if already here)
cd /d %~dp0

REM Activate Python virtual environment
call venv\Scripts\activate

REM Run FastAPI with Uvicorn
uvicorn main:app --reload --host 127.0.0.1 --port 8000

pause
