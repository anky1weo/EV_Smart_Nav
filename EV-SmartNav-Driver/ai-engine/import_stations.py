import os
import csv
import requests
import random
import time

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
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bWtidm1kdXRyaGpmbWhocm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAwNTQwOCwiZXhwIjoyMDk3NTgxNDA4fQ.ycNxdgeoTjAbQXgxBClHmQY3A7yPDrZYbjAqw2hKpiA"

csv_path = r"f:\EV Smart nav\EVSmartNav\ev-charging-stations-india.csv"

def import_data():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    url = f"{SUPABASE_URL}/rest/v1/charging_stations"

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        for row in reader:
            try:
                lat = float(row['lattitude'])
                lng = float(row['longitude'])
            except:
                continue

            station = {
                "name": row['name'].strip() if row['name'] else "Unknown Station",
                "latitude": lat,
                "longitude": lng,
                "address": row['address'].strip() if row['address'] else "India",
                "power_kw": random.choice([30, 50, 120, 150]),
                "station_type": "Fast",
                "available_slots": random.randint(1, 4),
                "total_slots": 4,
                "price_per_kwh": random.choice([15, 18, 20]),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "operator_name": str(row.get('type', "Public"))
            }
            batch.append(station)

            if len(batch) >= 100:
                resp = requests.post(url, headers=headers, json=batch)
                if resp.status_code not in (200, 201, 204):
                    print(f"Error inserting batch: {resp.text}")
                else:
                    count += len(batch)
                    print(f"Inserted {count} stations...")
                batch = []
                time.sleep(0.5)

        if batch:
            resp = requests.post(url, headers=headers, json=batch)
            if resp.status_code not in (200, 201, 204):
                print(f"Error inserting final batch: {resp.text}")
            else:
                count += len(batch)
                print(f"Inserted {count} stations total.")

if __name__ == "__main__":
    import_data()
