#!/usr/bin/env bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "[خطأ] Node.js غير مثبت: https://nodejs.org"; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund
[ -f .env ] || { cp .env.example .env; echo "تم إنشاء .env من النموذج"; }
echo "تشغيل النظام على http://localhost:4000"
npm start
