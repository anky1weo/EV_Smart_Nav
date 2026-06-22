@echo off
title EV SmartNav Launcher
echo Starting EV SmartNav Driver Project...

:: Navigate to the project directory
cd /d "F:\EV Smart nav\EVSmartNav\EV-SmartNav-Driver\frontend"

:: Start the Vite development server in a new terminal window
start "EV SmartNav Server" cmd /k "npm run dev"

:: Start the Python AI Engine backend in a new terminal window
start "EV SmartNav AI Engine" cmd /k "cd /d ""F:\EV Smart nav\EVSmartNav\EV-SmartNav-Driver\ai-engine"" && python main.py"

:: Wait for a few seconds to let the server start up
echo Waiting for the local server to start...
timeout /t 5 /nobreak > nul

:: Open the website in the default browser
start http://localhost:5173

echo Done! The website should open shortly.
exit
