import joblib
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ev_energy_model.joblib')
energy_model = joblib.load(MODEL_PATH)

def predict_energy_drain(distance_km, time_ms):
    time_hours = time_ms / 3600000.0
    avg_speed_kmh = distance_km / time_hours if time_hours > 0 else 50
    elevation_change_m = 0.0
    traffic_factor = 1.1 
    
    features = np.array([[distance_km, avg_speed_kmh, elevation_change_m, traffic_factor]])
    predicted_drain = energy_model.predict(features)[0]
    return float(max(predicted_drain, 0))

print(predict_energy_drain(600, 12*3600000))
