@echo off
chcp 65001 >nul
title Shaxmat turniri - server
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (py -3 server.py) else (python server.py)
echo.
echo Server yopildi. Oynani yopish uchun istalgan tugmani bosing.
pause >nul
