@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo No se encontro Python en este equipo.
  echo Abre index.html directamente con tu navegador o instala Python desde python.org.
  echo.
  pause
  exit /b 1
)

echo.
echo Iniciando Zent en http://localhost:8080 ...
echo Deja esta ventana abierta mientras usas la app. Presiona Ctrl+C para detenerla.
echo.

start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://localhost:8080'"
python -m http.server 8080

endlocal
