@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo  PriceFDM — сборка Windows-приложения
echo ============================================
echo.

:: Определяем директории
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "DIST_DIR=%ROOT_DIR%\dist-electron"
set "RELEASE_DIR=%ROOT_DIR%\release"

:: Собираем проект
echo [1/3] Сборка...
pushd "%ROOT_DIR%"
call npm run electron:build
popd
if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Сборка завершилась с ошибкой. Прерываем.
    pause
    exit /b 1
)

echo.
echo [2/3] Копирование файлов в папку release\...

:: Создаём папку release, если её нет
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

:: Копируем все .exe из dist-electron (portable + NSIS installer)
set "COPIED=0"
for %%f in ("%DIST_DIR%\*.exe") do (
    echo   Копирую: %%~nxf
    copy /y "%%f" "%RELEASE_DIR%\" >nul
    set /a COPIED+=1
)

if !COPIED! equ 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Файлы .exe в dist-electron\ не найдены.
    echo Возможно, electron-builder использует другой формат вывода.
    echo Смотрите содержимое папки dist-electron\ вручную.
) else (
    echo.
    echo [3/3] Готово! Скопировано файлов: !COPIED!
    echo Папка с файлами: %RELEASE_DIR%
)

echo.
pause
