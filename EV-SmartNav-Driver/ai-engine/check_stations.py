import os
import requests

def load_env():
    env_path = os.path.join('../frontend/.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    try:
                        key, val = line.strip().split('=', 1)
                        os.environ[key] = val
                    except:
                        pass
load_env()

supa_url = os.environ.get('VITE_SUPABASE_URL')
supa_key = os.environ.get('VITE_SUPABASE_ANON_KEY')

url = f"{supa_url}/rest/v1/charging_stations?select=*"
headers = {
    'apikey': supa_key,
    'Authorization': f'Bearer {supa_key}'
}

try:
    resp = requests.get(url, headers=headers)
    data = resp.json()
    print(f"Found {len(data)} stations!")
    if len(data) > 0:
        print("Sample:", data[0])
except Exception as e:
    print("Error:", e)
