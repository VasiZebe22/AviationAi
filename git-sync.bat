@echo off
echo Running Git Sync...
echo.

git add .
git commit -m "Auto-sync: %date% %time%"
git pull
git push

echo.
echo Git sync completed!
pause
