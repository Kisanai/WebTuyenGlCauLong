# Chia se web qua Cloudflare Tunnel.
#
# Buoc 1 - Backend:  cd backend; .\venv\bin\python.exe app.py
# Buoc 2 - Frontend: cd frontend; npm run dev
# Buoc 3 - Chay script nay

Write-Host ""
Write-Host "=== Cloudflare Tunnel ===" -ForegroundColor Cyan
Write-Host "Backend + 'npm run dev' phai dang chay truoc!" -ForegroundColor Yellow
Write-Host "Copy link https://....trycloudflare.com gui cho nguoi khac." -ForegroundColor Green
Write-Host ""

Set-Location "$PSScriptRoot\..\frontend"
npm run tunnel
