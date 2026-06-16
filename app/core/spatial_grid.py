import math
import random

def get_rainfall_value(lat: float, lon: float, day_index: int) -> float:
    """
    Generate pseudo-realistic rainfall data based on coordinate and day.
    """
    lat_factor = (lat + 6.0) * -5
    lon_factor = (lon - 111.25) * 8
    time_wave = math.sin(day_index * 0.4) * 15
    noise = random.random() * 8
    
    storm_x = 111.25 + abs(math.sin(day_index * 0.2)) * 1.5
    storm_y = -8.0 + abs(math.cos(day_index * 0.2)) * 2.0
    
    dist = math.sqrt((lat - storm_y)**2 + (lon - storm_x)**2)
    storm_effect = (0.8 - dist) * 50 if dist < 0.8 else 0
    
    raw_val = 10 + lat_factor + lon_factor + time_wave + storm_effect + noise
    return max(0.0, min(raw_val, 100.0))

def generate_grid(day_index: int):
    """
    Generates a 5x3 grid for radar visualization.
    """
    grid_lats = [-6.0, -6.5, -7.0, -7.5, -8.0]
    grid_lons = [111.25, 111.875, 112.50]
    
    grid = []
    max_val = 0
    total_val = 0
    risk_count = 0
    
    for lat in grid_lats:
        row = []
        for lon in grid_lons:
            val = round(get_rainfall_value(lat, lon, day_index), 1)
            row.append({"lat": lat, "lon": lon, "value": val})
            
            max_val = max(max_val, val)
            total_val += val
            if val > 30:
                risk_count += 1
                
        grid.append(row)
        
    avg_val = total_val / 15
    
    return {
        "grid": grid,
        "max": round(max_val, 1),
        "avg": round(avg_val, 1),
        "risk_count": risk_count
    }
