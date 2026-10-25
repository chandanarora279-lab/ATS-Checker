#!/usr/bin/env bash
# Render build: install backend deps, build the React app, prepare Django.
set -o errexit

pip install -r ATS-CHECKER/requirements.txt

cd frontend
npm ci
npm run build
cd ..

cd ATS-CHECKER/core
python manage.py collectstatic --no-input
python manage.py migrate --no-input
