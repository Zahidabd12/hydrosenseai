# HydroSense AI - Modular Architecture

A modular Python web application built with FastAPI.

## Project Structure
- `app/`
  - `core/`: ML models, spatial grids, and XAI logic.
  - `utils/`: Data utilities and BMKG classifiers.
  - `ui/`: HTML templates and static files (CSS, JS).
- `tests/`: Pytest test suite.
- `data/`: CSV Data directory for NASA POWER datasets.

## Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate: `.\venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Run server: `uvicorn app.main:app --reload`
