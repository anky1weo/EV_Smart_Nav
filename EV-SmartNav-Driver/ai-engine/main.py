from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import joblib
import numpy as np
import os
import math

# Load environment variables manually from frontend/.env
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    try:
                        key, val = line.strip().split('=', 1)
                        os.environ[key] = val
                    except ValueError:
                        pass
load_env()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
GRAPHHOPPER_API_KEY = "7e6523ec-721e-4311-a341-522673099c5d"

app = FastAPI(title="EV AI Routing Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ev_energy_model.joblib')
try:
    energy_model = joblib.load(MODEL_PATH)
    print("Loaded ML Energy Model successfully.")
except Exception as e:
    energy_model = None
    print(f"Warning: ML Model not found. Run train_model.py first. Error: {e}")

class RouteRequest(BaseModel):
    source_lat: float
    source_lng: float
    dest_lat: float
    dest_lng: float
    current_battery_pct: float
    battery_capacity_kwh: float = 60.0
    fear_threshold_pct: float = 15.0

def get_graphhopper_route(source, dest):
    url = f"https://graphhopper.com/api/1/route?point={source[0]},{source[1]}&point={dest[0]},{dest[1]}&profile=car&locale=en&calc_points=true&instructions=true&points_encoded=false&key={GRAPHHOPPER_API_KEY}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    return None

def fetch_charging_stations():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    url = f"{SUPABASE_URL}/rest/v1/charging_stations?select=*&limit=5000"
    try:
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"Error fetching stations from Supabase: {e}")
    return []

def predict_energy_drain(distance_km, time_ms):
    if not energy_model:
        return distance_km * 0.15 # Fallback
    
    time_hours = time_ms / 3600000.0
    avg_speed_kmh = distance_km / time_hours if time_hours > 0 else 50
    elevation_change_m = 0.0
    traffic_factor = 1.1 
    
    features = np.array([[distance_km, avg_speed_kmh, elevation_change_m, traffic_factor]])
    predicted_drain = energy_model.predict(features)[0]
    return float(max(predicted_drain, 0))

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371 # Earth radius km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def find_best_station(target_lat, target_lng):
    stations = fetch_charging_stations()
    if not stations:
        return None
    
    best_station = None
    min_dist = float('inf')
    
    for s in stations:
        dist = haversine_distance(target_lat, target_lng, float(s['latitude']), float(s['longitude']))
        if dist < min_dist:
            min_dist = dist
            best_station = s
            
    return best_station

def get_nearby_stations(route_coords, req_source_lat, req_source_lng, max_dist_km=10.0):
    stations = fetch_charging_stations()
    nearby = []
    
    if not route_coords or not stations:
        return []
        
    # Check every 20th point to speed up calculation
    check_coords = route_coords[::20]
    if route_coords[-1] not in check_coords:
        check_coords.append(route_coords[-1])
        
    for s in stations:
        try:
            s_lat = float(s['latitude'])
            s_lng = float(s['longitude'])
        except (ValueError, TypeError):
            continue
            
        is_near = False
        for lng, lat in check_coords:
            if abs(s_lat - lat) < 0.15 and abs(s_lng - lng) < 0.15:
                dist = haversine_distance(lat, lng, s_lat, s_lng)
                if dist <= max_dist_km:
                    is_near = True
                    break
        
        if is_near:
            dist_from_start = haversine_distance(req_source_lat, req_source_lng, s_lat, s_lng)
            nearby.append({
                "id": s.get("id", "station"),
                "name": s.get("name", "Charging Station"),
                "latitude": s_lat,
                "longitude": s_lng,
                "address": s.get("address", ""),
                "power_kw": s.get("power_kw", 50),
                "station_type": s.get("station_type", "Fast"),
                "connector_types": s.get("connector_types", ["Type 2"]),
                "available_slots": s.get("available_slots", 1),
                "total_slots": s.get("total_slots", 4),
                "price_per_kwh": s.get("price_per_kwh", 15),
                "rating": s.get("rating", 4.5),
                "operator_name": s.get("operator_name", ""),
                "distance_from_start_km": round(dist_from_start, 1)
            })
            
    return nearby

@app.post("/route")
async def calculate_optimal_route(req: RouteRequest):
    # 1. Ask GraphHopper for the direct route
    gh_data = get_graphhopper_route((req.source_lat, req.source_lng), (req.dest_lat, req.dest_lng))
    
    if not gh_data or "paths" not in gh_data or len(gh_data["paths"]) == 0:
        raise HTTPException(status_code=400, detail="Could not calculate direct route")
        
    path = gh_data["paths"][0]
    distance_km = path["distance"] / 1000.0
    
    # 2. Use ML to predict battery drain
    predicted_drain_kwh = predict_energy_drain(distance_km, path["time"])
    drain_pct = (predicted_drain_kwh / req.battery_capacity_kwh) * 100.0
    projected_arrival_battery = req.current_battery_pct - drain_pct
    
    # 3. Pit-Stop Logic
    pitstops = []
    final_geojson = path["points"]
    total_time_ms = path["time"]
    total_distance = path["distance"]
    
    # If the battery won't survive the trip
    if projected_arrival_battery < req.fear_threshold_pct:
        # Calculate maximum range based on current battery and fear threshold
        max_drain_pct = req.current_battery_pct - req.fear_threshold_pct
        if max_drain_pct <= 0:
            max_drain_pct = 1.0 # Very low battery, find nearest station immediately
            
        if drain_pct > 0:
            max_distance_km = distance_km * (max_drain_pct / drain_pct)
        else:
            max_distance_km = 0
            
        # Find the best station within reachable driving distance
        coords = final_geojson.get("coordinates", [])
        station = None
        best_reach = -1
        
        all_stations = fetch_charging_stations()
        for s in all_stations:
            try:
                s_lat = float(s['latitude'])
                s_lng = float(s['longitude'])
            except:
                continue
                
            min_dist_to_route = float('inf')
            closest_accum = 0
            accum = 0
            
            # Sub-sample coords for speed but keep accuracy
            for i in range(0, len(coords), 5):
                lng, lat = coords[i]
                if i > 0:
                    # Approximation of distance since we skip points
                    prev_lng, prev_lat = coords[i-5] if i >= 5 else coords[0]
                    accum += haversine_distance(prev_lat, prev_lng, lat, lng)
                    
                if accum > max_distance_km + 30:
                    break
                    
                if abs(s_lat - lat) < 0.2 and abs(s_lng - lng) < 0.2:
                    dist = haversine_distance(lat, lng, s_lat, s_lng)
                    if dist < min_dist_to_route:
                        min_dist_to_route = dist
                        closest_accum = accum
                        
            estimated_drive_dist = closest_accum + min_dist_to_route
            # Must be near route and reachable within battery range
            if min_dist_to_route <= 15.0 and estimated_drive_dist <= max_distance_km:
                if estimated_drive_dist > best_reach:
                    best_reach = estimated_drive_dist
                    station = s
                    
        # Fallback if no station is perfectly within range
        if not station:
            station = find_best_station(req.source_lat, req.source_lng)
        
        if station:
            st_lat, st_lng = float(station['latitude']), float(station['longitude'])
            # Route 1: Origin to Station
            route1 = get_graphhopper_route((req.source_lat, req.source_lng), (st_lat, st_lng))
            # Route 2: Station to Destination
            route2 = get_graphhopper_route((st_lat, st_lng), (req.dest_lat, req.dest_lng))
            
            if route1 and route2:
                path1 = route1["paths"][0]
                path2 = route2["paths"][0]
                
                coords1 = path1["points"]["coordinates"]
                coords2 = path2["points"]["coordinates"]
                final_geojson["coordinates"] = coords1 + coords2
                
                total_time_ms = path1["time"] + path2["time"]
                total_distance = path1["distance"] + path2["distance"]
                
                pitstops.append({
                    "id": station.get("id", "pitstop-1"),
                    "name": station.get("name", "Charging Station"),
                    "latitude": st_lat,
                    "longitude": st_lng,
                    "address": station.get("address", "AI Selected Station"),
                    "power_kw": station.get("power_kw", 50),
                    "station_type": station.get("station_type", "Fast"),
                    "connector_types": station.get("connector_types", ["Type 2"]),
                    "available_slots": station.get("available_slots", 1),
                    "total_slots": station.get("total_slots", 4),
                    "price_per_kwh": station.get("price_per_kwh", 15),
                    "rating": station.get("rating", 4.5),
                    "operator_name": station.get("operator_name", ""),
                    "charge_time_mins": 30,
                    "distance_from_start_km": round(haversine_distance(req.source_lat, req.source_lng, st_lat, st_lng), 1)
                })
                
                drain_leg2_kwh = predict_energy_drain(path2["distance"]/1000.0, path2["time"])
                projected_arrival_battery = 80.0 - ((drain_leg2_kwh / req.battery_capacity_kwh) * 100.0)

    # Find other nearby stations along the final route
    nearby_stations = get_nearby_stations(final_geojson.get("coordinates", []), req.source_lat, req.source_lng, max_dist_km=15.0)
    
    # Remove pitstops from nearby to avoid duplicates
    pitstop_ids = {p["id"] for p in pitstops}
    nearby_stations = [ns for ns in nearby_stations if ns["id"] not in pitstop_ids]

    return {
        "success": True,
        "direct_route_possible": len(pitstops) == 0,
        "predicted_arrival_battery_pct": round(projected_arrival_battery, 1),
        "total_distance_km": round(total_distance / 1000.0, 1),
        "total_drive_time_mins": math.floor(total_time_ms / 60000),
        "pitstops": pitstops,
        "nearby_stations": nearby_stations,
        "route_geojson": final_geojson
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
