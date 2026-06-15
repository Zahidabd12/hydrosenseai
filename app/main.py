import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.core.spatial_grid import generate_grid
from app.core.ml_engine import run_inference, PredictionRequest
from app.utils.bmkg_classifier import classify_rainfall
from app.utils.date_converter import doy_to_date

app = FastAPI(title="HydroSense AI")

# Use absolute paths so Vercel can find the directories regardless of CWD
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "ui", "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "ui", "templates")

# Mount static files safely
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Setup templates safely
if os.path.isdir(TEMPLATES_DIR):
    templates = Jinja2Templates(directory=TEMPLATES_DIR)
else:
    templates = None

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    if templates:
        return templates.TemplateResponse("index.html", {"request": request})
    return f"<h1>Error: Templates directory not found at {TEMPLATES_DIR}</h1>"

@app.get("/api/debug_paths")
async def debug_paths():
    return {
        "BASE_DIR": BASE_DIR,
        "STATIC_DIR": STATIC_DIR,
        "TEMPLATES_DIR": TEMPLATES_DIR,
        "static_exists": os.path.isdir(STATIC_DIR),
        "templates_exists": os.path.isdir(TEMPLATES_DIR),
        "cwd": os.getcwd(),
        "files_in_base": os.listdir(BASE_DIR) if os.path.exists(BASE_DIR) else [],
        "files_in_templates": os.listdir(TEMPLATES_DIR) if os.path.exists(TEMPLATES_DIR) else [],
        "files_in_static": os.listdir(STATIC_DIR) if os.path.exists(STATIC_DIR) else []
    }

@app.get("/api/radar")
async def get_radar_data(day: int):
    return generate_grid(day)

@app.post("/api/predict")
async def predict(req: PredictionRequest):
    return run_inference(req)

@app.get("/api/classify")
async def classify(rainfall: float):
    return classify_rainfall(rainfall)
    
@app.get("/api/convert_date")
async def convert_date(year: int, doy: int):
    return doy_to_date(year, doy)
