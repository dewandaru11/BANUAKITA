@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo BANUAKITA - BUILD WINDOWS EXE OFFLINE RUNTIME
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js belum terpasang.
  echo Install Node.js LTS terlebih dahulu.
  pause
  exit /b 1
)

node -v
npm -v

echo.
echo [1/4] Memasang dependency pembuat aplikasi...
npm install
if errorlevel 1 (
  echo [ERROR] npm install gagal.
  pause
  exit /b 1
)

echo.
echo [2/4] Membuat folder library lokal...
npm run prepare-vendor
if errorlevel 1 (
  echo [ERROR] prepare-vendor gagal.
  pause
  exit /b 1
)

echo.
echo [3/4] Mengambil model OCR Bahasa Indonesia + Inggris...
if not exist "vendor\tesseract\lang-data" mkdir "vendor\tesseract\lang-data"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'https://tessdata.projectnaptha.com/4.0.0/ind.traineddata.gz' -OutFile 'vendor/tesseract/lang-data/ind.traineddata.gz'; Invoke-WebRequest -UseBasicParsing -Uri 'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz' -OutFile 'vendor/tesseract/lang-data/eng.traineddata.gz' } catch { Write-Error $_; exit 1 }"
if errorlevel 1 (
  echo [ERROR] Model OCR gagal diunduh.
  echo Anda dapat menyalin sendiri ind.traineddata.gz dan eng.traineddata.gz ke vendor\tesseract\lang-data\
  pause
  exit /b 1
)

echo.
echo [4/4] Membuat installer NSIS + EXE portable...
npm run dist
if errorlevel 1 (
  echo [ERROR] Build EXE gagal.
  pause
  exit /b 1
)

echo.
echo ==============================================
echo SELESAI
echo Hasil ada di folder dist\
echo ==============================================
dir /b dist
pause
