import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import os

# 1. Generate Synthetic Data
print("Generating synthetic EV telemetry data...")
np.random.seed(42)
n_samples = 10000

# Features:
# distance_km: 1 to 500 km
# avg_speed_kmh: 30 to 120 km/h
# elevation_change_m: -1000 to +1000 meters (negative means downhill)
# traffic_factor: 1.0 (clear) to 2.0 (heavy stop-and-go)
distance_km = np.random.uniform(1, 500, n_samples)
avg_speed_kmh = np.random.uniform(30, 120, n_samples)
elevation_change_m = np.random.uniform(-1000, 1000, n_samples)
traffic_factor = np.random.uniform(1.0, 2.0, n_samples)

# Base consumption: ~0.15 kWh per km for a standard EV
base_drain = distance_km * 0.15

# Modifiers
# Higher speed increases drag (aerodynamic drag scales with velocity squared)
speed_modifier = 1 + ((avg_speed_kmh - 60) / 60) ** 2 * 0.5

# Elevation: uphill adds drain, downhill regens
# ~0.005 kWh per meter of elevation gain
elevation_modifier = elevation_change_m * 0.002

# Traffic increases drain due to idling/HVAC and stop-and-go
traffic_modifier = traffic_factor * 1.1

# Target: battery_drain_kwh
# We add some random noise to simulate weather/driver behavior
noise = np.random.normal(0, 1.5, n_samples)
battery_drain_kwh = (base_drain * speed_modifier * traffic_modifier) + elevation_modifier + noise

# Ensure no negative drain (even with heavy regen, it's limited)
battery_drain_kwh = np.maximum(battery_drain_kwh, 0.0)

df = pd.DataFrame({
    'distance_km': distance_km,
    'avg_speed_kmh': avg_speed_kmh,
    'elevation_change_m': elevation_change_m,
    'traffic_factor': traffic_factor,
    'battery_drain_kwh': battery_drain_kwh
})

X = df[['distance_km', 'avg_speed_kmh', 'elevation_change_m', 'traffic_factor']]
y = df['battery_drain_kwh']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. Train XGBoost Model
print("Training XGBoost Energy Prediction Model...")
model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
model.fit(X_train, y_train)

# 3. Evaluate
preds = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, preds))
print(f"Model RMSE: {rmse:.4f} kWh")

# 4. Save the model
model_path = os.path.join(os.path.dirname(__file__), 'ev_energy_model.joblib')
joblib.dump(model, model_path)
print(f"Model saved successfully to {model_path}")
