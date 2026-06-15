from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.core.spatial_grid import generate_grid
from app.core.ml_engine import run_inference, PredictionRequest
from app.utils.bmkg_classifier import classify_rainfall
from app.utils.date_converter import doy_to_date

app = FastAPI(title="HydroSense AI")

# Mount static files
app.mount("/static", StaticFiles(directory="app/ui/static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="app/ui/templates")

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
