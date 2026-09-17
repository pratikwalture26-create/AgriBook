#!/usr/bin/env python3
"""
AgriBook: Smart Agricultural Procurement Slot & Queue Management
Smart India Hackathon 2026 - Problem Statement 26032 (SIH26032)
Ministry of Consumer Affairs, Food & Public Distribution

Module: XGBoost Demand Forecasting Model
----------------------------------------
This script:
1. Generates a realistic synthetic historical dataset simulating APMC mandi arrivals
   across Maharashtra & Madhya Pradesh centres for Cotton, Soyabean, Paddy, and Wheat.
2. Trains an XGBoost Regressor (xgb.XGBRegressor) using tabular operational features.
3. Computes evaluation metrics (RMSE, MAE, R^2 score) and extracts Gini feature importance.
4. Provides an inference function `predict_centre_demand(...)` for production deployment.

Note: Real historical mandi data from state agricultural marketing boards can directly
replace the synthetic training dataframe without modifying the model pipeline.
"""

import sys
import numpy as np
import pandas as pd

# Fallback check for xgboost & scikit-learn
try:
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False


def generate_representative_mandi_dataset(n_samples: int = 2500) -> pd.DataFrame:
    """
    Generates representative tabular data mimicking real procurement seasons.
    Features:
      - centre_capacity: Daily intake capacity (80 - 150 farmers/day)
      - processing_rate_per_hr: Weighment & inspection rate (5 - 10/hr)
      - day_of_week: 0 (Sun) through 6 (Sat). Mondays and Thursdays have surge peaks.
      - hour_of_day: Operating hours (9 AM to 6 PM)
      - crop_encoded: 0=Cotton, 1=Soyabean, 2=Wheat, 3=Paddy, 4=Tur
      - is_harvest_peak: 1 during Sep-Nov post-monsoon arrivals, 0 otherwise
      - advance_bookings_count: Slots already reserved in advance
      - historical_7day_avg: 7-day trailing average arrivals
      - target: actual_arrivals_count (Expected daily demand)
    """
    np.random.seed(26032)

    centre_capacity = np.random.choice([80, 100, 120, 150], size=n_samples)
    processing_rate = np.random.choice([5, 7, 8, 9, 10], size=n_samples)
    day_of_week = np.random.randint(0, 7, size=n_samples)
    crop_encoded = np.random.randint(0, 5, size=n_samples)
    is_harvest_peak = np.random.choice([1, 0], p=[0.65, 0.35], size=n_samples)
    advance_bookings = np.random.randint(10, 80, size=n_samples)
    historical_avg = np.random.normal(loc=65, scale=20, size=n_samples).clip(20, 140)

    # Heuristic ground truth with non-linear interactions mimicking agricultural cycles
    day_multiplier = np.where(day_of_week == 1, 1.30, np.where(day_of_week == 4, 1.20, 1.0))
    crop_multiplier = np.where(crop_encoded <= 1, 1.35, 1.0) # Cotton & Soyabean harvest surge
    
    demand = (
        0.45 * historical_avg
        + 0.35 * advance_bookings
        + 0.20 * (centre_capacity * 0.4)
    ) * day_multiplier * (1.0 + 0.30 * is_harvest_peak) * crop_multiplier

    # Add Gaussian noise representing unobserved weather/transport factors
    noise = np.random.normal(0, 5, size=n_samples)
    actual_arrivals = np.round((demand + noise).clip(15, centre_capacity * 1.35))

    df = pd.DataFrame({
        'centre_capacity': centre_capacity,
        'processing_rate_per_hr': processing_rate,
        'day_of_week': day_of_week,
        'crop_encoded': crop_encoded,
        'is_harvest_peak': is_harvest_peak,
        'advance_bookings_count': advance_bookings,
        'historical_7day_avg': historical_avg,
        'actual_arrivals_count': actual_arrivals
    })
    return df


def train_xgboost_demand_model():
    """
    Trains the XGBoost Regressor and outputs performance metrics.
    """
    print("=" * 65)
    print("AgriBook: Training XGBoost Demand Forecasting Model (SIH26032)")
    print("=" * 65)

    df = generate_representative_mandi_dataset(n_samples=3000)
    features = [
        'centre_capacity',
        'processing_rate_per_hr',
        'day_of_week',
        'crop_encoded',
        'is_harvest_peak',
        'advance_bookings_count',
        'historical_7day_avg'
    ]
    target = 'actual_arrivals_count'

    X = df[features]
    y = df[target]

    if not HAS_ML_LIBS:
        print("[Notice] Python 'xgboost' or 'scikit-learn' not installed in local environment.")
        print("[Notice] The AgriBook system includes an equivalent pure TypeScript ML inference engine")
        print("         at /src/services/xgboostEngine.ts that runs directly inside the application.")
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=26032)

    model = xgb.XGBRegressor(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=26032
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print(f"Dataset Size: {len(df)} records (Representative Demo Dataset)")
    print(f"Validation RMSE: {rmse:.2f} farmers")
    print(f"R^2 Accuracy Score: {r2:.3f}")
    print("\nFeature Importances:")
    for feat, imp in zip(features, model.feature_importances_):
        print(f"  - {feat:25s}: {imp * 100:.1f}%")

    print("\nSample Inferences for Procurement Hubs (18 Sep 2026):")
    sample_centres = [
        {"name": "Wardha Central APMC Sub-Yard", "cap": 100, "rate": 8, "dow": 5, "crop": 0, "adv": 35, "hist": 70},
        {"name": "Amravati Cotton Mandi",       "cap": 100, "rate": 5, "dow": 5, "crop": 0, "adv": 75, "hist": 115},
        {"name": "Yavatmal Soyabean Kendra",    "cap": 80,  "rate": 7, "dow": 5, "crop": 1, "adv": 20, "hist": 48},
    ]

    for sc in sample_centres:
        x_vec = pd.DataFrame([{
            'centre_capacity': sc['cap'],
            'processing_rate_per_hr': sc['rate'],
            'day_of_week': sc['dow'],
            'crop_encoded': sc['crop'],
            'is_harvest_peak': 1,
            'advance_bookings_count': sc['adv'],
            'historical_7day_avg': sc['hist']
        }])
        pred = model.predict(x_vec)[0]
        load = (pred / sc['cap']) * 100
        status = "HIGH CONGESTION" if load > 85 else "NORMAL"
        print(f"  • {sc['name']:32s} -> Predicted Demand: {int(pred):3d} farmers ({load:.0f}% load, {status})")


if __name__ == '__main__':
    train_xgboost_demand_model()
