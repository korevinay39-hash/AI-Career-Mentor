@echo off
echo ===================================================
echo           Starting AI Career Mentor
echo ===================================================
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start cmd /k ".\venv\Scripts\uvicorn server:app --reload --port 8000"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
cd frontend
start cmd /k "npm run dev"

echo ===================================================
echo Both services launched!
echo Open your browser at: http://localhost:5173
echo ===================================================
