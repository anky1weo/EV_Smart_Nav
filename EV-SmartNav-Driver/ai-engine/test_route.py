import requests
import json
req = {
    "source_lat": 28.6139,
    "source_lng": 77.2090,
    "dest_lat": 24.5373,
    "dest_lng": 81.3042,
    "current_battery_pct": 10,
    "battery_capacity_kwh": 60,
    "fear_threshold_pct": 15
}
resp = requests.post("http://localhost:8000/route", json=req)
print(json.dumps(resp.json().get('pitstops', []), indent=2))
