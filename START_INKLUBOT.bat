@echo off
title InkluBot Launcher

echo Starting InkluBot services...

cd /d "%~dp0"

start "InkluBot Telegram" cmd /k "python bot.py"
start "InkluBot SMS Simulator" cmd /k "python -m uvicorn sms_simulator:app --reload --port 8500"
start "InkluBot AI API" cmd /k "python -m uvicorn main:app --reload --port 8000"

echo.
echo InkluBot is starting.
echo Telegram bot: running
echo SMS simulator: http://127.0.0.1:8500
echo AI API: http://127.0.0.1:8000/docs
echo.
echo Keep all three windows open while testing.
pause