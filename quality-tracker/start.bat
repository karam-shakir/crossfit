@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo [خطأ] Node.js غير مثبت. حمّله من https://nodejs.org ثم أعد المحاولة. & pause & exit /b 1)
if not exist node_modules (echo جاري تثبيت الحزم لأول مرة... & call npm install --no-audit --no-fund || (pause & exit /b 1))
if not exist .env (copy .env.example .env >nul & echo تم إنشاء ملف .env من النموذج - عدّله لاحقاً لإدخال إعدادات البريد.)
echo.
echo تشغيل نظام متابعة وثائق الجودة... افتح المتصفح على http://localhost:4000
echo (اتركه مفتوحاً؛ لإيقافه اضغط Ctrl+C)
echo.
call npm start
pause
