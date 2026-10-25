# ATS Checker — Frontend

React + Vite UI for the Django backend in `../ATS-CHECKER/core`.

## Run (development)

**1. Backend** (terminal 1):

```powershell
cd G:\Project-1\ATS-CHECKER\core
..\..\myenv\Scripts\activate
$env:GROQ_API_KEY = "your-groq-key"
python manage.py migrate
python manage.py runserver 8000
```

**2. Frontend** (terminal 2):

```powershell
cd G:\Project-1\frontend
npm install
npm run dev
```

Open http://localhost:5173.

Vite forwards `/api/*` to `http://127.0.0.1:8000`, so the backend needs no CORS setup.
Set `VITE_API_TARGET` to point the proxy somewhere else.

## Structure

- `src/api.js`: fetch wrapper for `/api/jobs/` and `/api/resume/`
- `src/components/JobSelector.jsx`: pick or create a job description
- `src/components/ResumeUpload.jsx`: PDF drag-and-drop (max 5 MB, same limit as the backend)
- `src/components/Results.jsx`: match score, matching and missing skills, suggestions
