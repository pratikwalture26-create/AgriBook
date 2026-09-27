# AgriBook: Setup Instructions & Architecture Guide
**Smart India Hackathon 2026 - Problem Statement 26032 (SIH26032)**  
*Ministry of Consumer Affairs, Food & Public Distribution*

## Tech Stack Overview & Responsibilities
- **Frontend (Mobile & Web UI)**: Responsive mobile-first interface designed for farmers, operators, and state administrators. Includes bilingual English/Hindi localization and phone-based booking fallback.
- **Backend (Node.js & Express)**: Business logic, authentication, slot allocation heuristics, and REST API routing.
- **Persistent Database (MongoDB)**: Permanent storage for farmer profiles, procurement centres, bookings, procurements, payments, and immutable audit logs.
- **Real-Time Fast State Layer (Redis)**: Low-latency atomic queue state (`queue:{centreId}`, `token:{tokenNumber}`) to prevent double-booking and calculate live position in <2ms.
- **Machine Learning (Python & XGBoost)**: Gradient boosted tree forecasting expected daily arrivals to detect congestion early and proactively reroute farmers to less-congested centres.
- **Communication (Twilio SMS)**: Transactional SMS dispatch for OTPs, slot booking confirmations, queue calls, and payment updates.
- **Payment (Razorpay Prototype)**: Prototype simulation layer modeling the government MSP payment lifecycle (INITIATED -> PROCESSING -> PAID).

---

## Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.9+ (optional for re-running `ml/demand_forecast.py`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default values enable mock modes (`MOCK_SMS=true`, `MOCK_PAYMENTS=true`) so the hackathon prototype runs out-of-the-box without requiring live Twilio or Razorpay paid accounts.

### 4. Start Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

---

## 3-Minute SIH Demo Pitch Guide
1. **Farmer Experience**: Log in as demo farmer *Ramesh Patil* (Wardha, Cotton 45 Qtl). Observe active Token **A105** with live queue position #4 and estimated wait time 28 minutes.
2. **AI Slot Recommendation & Congestion Alert**: Click *"Book Procurement Slot"*. Select *Amravati Mandi* to trigger the **High Congestion Warning** (65 in queue, 89% load). Observe AgriBook recommending nearby *Wardha APMC*, saving ~50 minutes of waiting time!
3. **Operator Terminal**: Switch to *Centre Operator* view. Click *[Call Next Farmer]*. Notice the live queue updates in real-time, sending a simulated Twilio SMS alert.
4. **Weighment & Payment**: Click *[Complete]* to enter verified quintals and quality grade. Notice the MSP calculation (e.g. ₹7,521/qtl for Cotton) and automatic payment trigger. Click *[Simulate Paid]* to mark the direct transfer complete.
5. **Government Admin Oversight**: Switch to *Admin Analytics* to view cross-centre capacity utilization, XGBoost feature weights, and the immutable audit trail.
6. **Phone-Based Booking**: Switch to *Helpline Console (Toll-Free 1800-180-26032)* to see how customer care agents book slots on behalf of farmers who lack smartphones.
