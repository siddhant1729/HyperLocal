@echo off
echo ========================================
echo  Food Rescue Platform - Frontend Setup
echo ========================================

cd /d "%~dp0"

echo [1/2] Installing dependencies...
npm install

echo [2/2] Starting Vite dev server on http://localhost:5173
npm run dev
