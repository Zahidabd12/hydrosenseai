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

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Setup templates
templates = Jinja2Templates(directory=TEMPLATES_DIR)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

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
