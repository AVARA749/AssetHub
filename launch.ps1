# AssetHub Launch Synchronization Script
# Run this to install dependencies and start both backend and frontend.

Write-Host "🚀 Launching AssetHub Synchronization..." -ForegroundColor Cyan

# 1. Backend Setup & DB Init
Write-Host "`n📦 Initializing Backend Server..." -ForegroundColor Yellow
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env. Please configure DB credentials before proceeding!" -ForegroundColor Magenta
}

$initDb = Read-Host "Do you want to initialize/wipe the PostgreSQL database now? [y/n]"
if ($initDb -eq 'y') {
    cd backend
    npm install
    npm run init-db
    cd ..
} else {
    cd backend
    npm install
    cd ..
}

# 2. Frontend Setup
Write-Host "`n📦 Initializing Frontend Application..." -ForegroundColor Yellow
if (!(Test-Path "frontend\.env.local")) {
    New-Item "frontend\.env.local" -ItemType File -Value "NEXT_PUBLIC_API_URL=http://localhost:5000/api"
    Write-Host "✅ Created frontend/.env.local pointing to localhost:5000." -ForegroundColor Green
}
cd frontend
npm install
cd ..

# 3. Execution (Simultaneous processes)
Write-Host "`n🔥 Starting Services..." -ForegroundColor Cyan
Write-Host "TIP: Use Ctrl+C to terminate both once connected." -ForegroundColor Gray

# Start backend in a separate window
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; npm run dev" -WindowStyle Normal
Write-Host "✅ Backend initiated on port 5000." -ForegroundColor Green

# Start frontend in this window
Write-Host "✅ Frontend initiating on port 3000..." -ForegroundColor Green
cd frontend
npm run dev
