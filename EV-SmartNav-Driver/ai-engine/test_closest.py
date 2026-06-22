import os
import requests
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

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
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bWtidm1kdXRyaGpmbWhocm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAwNTQwOCwiZXhwIjoyMDk3NTgxNDA4fQ.ycNxdgeoTjAbQXgxBClHmQY3A7yPDrZYbjAqw2hKpiA"

def test():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    url = f"{SUPABASE_URL}/rest/v1/charging_stations?select=*"
    resp = requests.get(url, headers=headers)
    stations = resp.json()
    print(f"Total stations: {len(stations)}")
    
    target_lat = 28.6139
    target_lng = 77.2090
    
    min_dist = float('inf')
    best_station = None
    
    for s in stations:
        dist = haversine_distance(target_lat, target_lng, float(s['latitude']), float(s['longitude']))
        if dist < min_dist:
            min_dist = dist
            best_station = s
            
    print(f"Best station: {best_station['name']} at dist {min_dist}")

test()
