# AgriBook: XGBoost Demand Forecasting Component
**Smart India Hackathon 2026 (SIH26032)**  
*Ministry of Consumer Affairs, Food & Public Distribution*

## Overview
AgriBook applies an **XGBoost Regressor (`xgb.XGBRegressor`)** to forecast daily farmer arrival volumes across procurement centres. Unlike deep learning approaches that introduce unnecessary infrastructure overhead for tabular operational metrics, XGBoost provides high interpretability, low latency (~5ms inference), and robust handling of non-linear seasonal cycles.

## Features Used in Training
1. **`centre_capacity`**: Rated daily throughput limit (farmers/day).
2. **`processing_rate_per_hr`**: Weighment and quality inspection throughput speed.
3. **`day_of_week`**: Day index (0-6). Mandis traditionally experience severe influx on Mondays and Thursdays.
4. **`crop_encoded`**: Target crop being delivered (Cotton, Soyabean, Paddy, Wheat, Tur).
5. **`is_harvest_peak`**: Binary seasonal flag indicating active Kharif or Rabi post-harvest arrival periods.
6. **`advance_bookings_count`**: Total slots pre-booked through the mobile app and helpline.
7. **`historical_7day_avg`**: Trailing average arrivals over the preceding week.

## Output
- **`predicted_demand`**: Anticipated number of farmers expected at the procurement centre.
- **`congestion_risk`**: Evaluated as `predicted_demand / centre_capacity`.
  - `< 65%`: Normal
  - `65% - 85%`: Moderate Load
  - `> 85%`: High Congestion (Triggers alternative nearby centre recommendation)

## How to Run the Training Script
```bash
cd ml
pip install xgboost scikit-learn pandas numpy
python demand_forecast.py
```

## Note on Datasets for Hackathon Prototype
As real-time multi-year state mandi arrival feeds require official government API access, this prototype utilizes a **statistically calibrated synthetic dataset** reflecting realistic Kharif harvest arrival volumes in Maharashtra and Madhya Pradesh. The pipeline is designed so real civil supplies logs can replace the data generator without code modification.
