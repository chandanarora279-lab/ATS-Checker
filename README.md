# ATS Resume Checker

Upload a PDF resume, pick a job description, and get an AI analysis: match percentage, matching and missing skills, and suggestions to improve.

- **Backend:** Django + Django REST Framework (`ATS-CHECKER/core`). Extracts PDF text with pdfplumber and analyzes it with an LLM on Groq.
- **Frontend:** React + Vite (`frontend`)

## Local development

Backend:

```powershell
python -m venv myenv
myenv\Scripts\activate
pip install -r ATS-CHECKER/requirements.txt
cd ATS-CHECKER/core
echo GROQ_API_KEY=your-groq-key > .env
python manage.py migrate
python manage.py runserver 8000
```

Frontend (second terminal):

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to Django on port 8000.

Run the backend tests with `python manage.py test` from `ATS-CHECKER/core`.

## Deployment (Render)

`render.yaml` defines a single web service. `build.sh` builds the React app, and Django serves it at `/` through WhiteNoise, next to the API at `/api/`.

1. Push this repo to GitHub.
2. On Render: **New → Blueprint**, then select the repo.
3. When prompted, enter `GROQ_API_KEY`. `DJANGO_SECRET_KEY` is generated automatically.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Required. Groq API key for the analysis. |
| `DJANGO_SECRET_KEY` | Required in production. |
| `DJANGO_DEBUG` | `False` in production. |
| `DJANGO_ALLOWED_HOSTS` | Extra comma-separated hostnames. Render's hostname is added automatically. |
| `DATABASE_URL` | Optional, e.g. a Postgres URL. Defaults to SQLite. |

On Render's free plan the disk is temporary, so SQLite data (saved job descriptions) is reset on every deploy or restart. To keep the data, set `DATABASE_URL` to a Postgres database.

## API

| Method | Endpoint | Body |
| --- | --- | --- |
| GET | `/api/jobs/` | (none) |
| POST | `/api/jobs/` | `job_title`, `job_description` |
| POST | `/api/resume/` | multipart: `job_description` (id), `resume` (PDF, max 5 MB) |
