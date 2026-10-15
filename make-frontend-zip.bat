@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Creating clean frontend ZIP...
echo ==========================================

set "SOURCE=%CD%"

for %%I in ("%SOURCE%") do set "FOLDER_NAME=%%~nxI"

set "TEMP_DIR=%TEMP%\%FOLDER_NAME%-upload-clean-%RANDOM%%RANDOM%"
set "ZIP_PATH=%SOURCE%\..\%FOLDER_NAME%-upload-clean.zip"

echo Source folder:
echo %SOURCE%
echo.
echo Output ZIP:
echo %ZIP_PATH%
echo.

if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
if exist "%ZIP_PATH%" del /f /q "%ZIP_PATH%"

robocopy "%SOURCE%" "%TEMP_DIR%" /MIR ^
/XD node_modules .next out .git .turbo dist build coverage ^
/XF *.zip *.log .env .env.local .env.production .env.development tsconfig.tsbuildinfo

if %ERRORLEVEL% GEQ 8 (
    echo.
    echo Robocopy failed. ZIP not created.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%ZIP_PATH%' -Force"

if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"

echo.
echo ==========================================
echo ZIP created successfully:
echo %ZIP_PATH%
echo ==========================================
pause