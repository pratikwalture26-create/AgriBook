# AgriBook REST API Documentation
**Smart India Hackathon 2026 (SIH26032)**  
*Ministry of Consumer Affairs, Food & Public Distribution*

## Base URL
`/api`

---

### 1. Authentication

#### Send OTP
- **Endpoint:** `POST /api/auth/send-otp`
- **Request Body:**
  ```json
  {
    "mobile": "9822104512"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent via Twilio SMS service",
    "demoOtp": "26032"
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /api/auth/verify-otp`
- **Request Body:**
  ```json
  {
    "mobile": "9822104512",
    "otp": "26032"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_agribook_9822104512_1726500000000",
    "farmer": {
      "mobile": "9822104512",
      "verified": true
    }
  }
  ```

---

### 2. Live Queue & Redis Layer

#### Get Current Centre Queue
- **Endpoint:** `GET /api/queue/:centreId`
- **Response:**
  ```json
  {
    "centreId": "centre-1",
    "activeQueueDepth": 18,
    "timestamp": "2026-09-18T10:00:00.000Z"
  }
  ```

#### Operator: Call Next Farmer
- **Endpoint:** `POST /api/queue/call-next`
- **Request Body:**
  ```json
  {
    "centreId": "centre-1"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "calledToken": {
      "tokenNumber": "A103",
      "farmerName": "Prakash Rao",
      "farmerMobile": "9422119988",
      "status": "CALLED"
    }
  }
  ```

---

### 3. Procurement & Payments

#### Trigger Payment (Prototype Simulation)
- **Endpoint:** `POST /api/payments/trigger`
- **Request Body:**
  ```json
  {
    "procurementId": "proc-1",
    "farmerId": "farmer-6",
    "amount": 300840,
    "bankAccountLastFour": "7721"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "referenceNumber": "PX-2026-00125",
    "status": "PROCESSING",
    "amount": 300840
  }
  ```

#### Simulate Payment Paid
- **Endpoint:** `POST /api/payments/:id/simulate`
- **Response:**
  ```json
  {
    "success": true,
    "referenceNumber": "PX-2026-00125",
    "status": "PAID",
    "settledAt": "2026-09-18T10:15:00.000Z"
  }
  ```
