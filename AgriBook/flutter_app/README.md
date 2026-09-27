# AgriBook Mobile App (Flutter)
**Smart India Hackathon 2026 - Problem Statement 26032 (SIH26032)**  
*Ministry of Consumer Affairs, Food & Public Distribution*

## Overview
This Flutter application provides a unified, cross-platform mobile client for farmers, mandi operators, and state monitoring officers.

## Architecture: Flutter → Node.js Express → MongoDB / Redis
```
┌─────────────────────────┐
│   Flutter Mobile App    │
│  (Farmer/Operator/Admin)│
└────────────┬────────────┘
             │ HTTP REST (JSON)
             ▼
┌─────────────────────────┐
│   Node.js Express API   │
│       (/api/*)          │
└─────┬─────────────┬─────┘
      │             │
      ▼             ▼
┌───────────┐ ┌───────────┐
│  MongoDB  │ │   Redis   │
│ Documents │ │Live Queues│
└───────────┘ └───────────┘
```

## Running the Flutter Application
1. **Ensure Node.js backend is running:**
   ```bash
   npm run dev
   # Express backend running at http://localhost:3000/api
   ```

2. **Configure API Base URL in `lib/services/api_service.dart`:**
   - For Android Emulator: `http://10.0.2.2:3000/api`
   - For Physical Device: `http://<your-local-ip>:3000/api`
   - For Web / Desktop / iOS Simulator: `http://localhost:3000/api`

3. **Install Dependencies & Launch:**
   ```bash
   cd flutter_app
   flutter pub get
   flutter run
   ```
