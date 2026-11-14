@echo off
title InkluBot Setup

echo Installing InkluBot requirements...

cd /d "%~dp0"

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo Setup complete.
echo Now double-click START_INKLUBOT.bat to run the project.
pause