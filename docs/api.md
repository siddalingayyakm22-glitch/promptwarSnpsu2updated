# CyberShield AI — REST API Documentation

All responses follow the standardized envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Endpoints

### 1. Health & Status
- **`GET /api/health`**
  - Returns backend service liveness status.
- **`GET /api/health/ready`**
  - Returns database connection status and Python AI microservice readiness.
- **`GET /api/models/status`**
  - Returns loaded model names, versions, and validation status.

### 2. Threat Analysis
- **`POST /api/analyze/url`**
  - **Body:** `{ "url": "string" }`
  - Returns risk score (0-100), classification (`SAFE`, `SUSPICIOUS`, `HIGH_RISK`), indicators, and recommendations.
- **`POST /api/analyze/message`**
  - **Body:** `{ "message": "string" }`
  - Returns scam likelihood, extracted phone numbers/links, urgency signals, and NLP model output.
- **`POST /api/analyze/email`**
  - **Body:** `{ "sender": "", "displayName": "", "replyTo": "", "subject": "", "body": "", "rawHeaders": "" }`
  - Returns sender risk, message BEC risk, link risk, and cryptographic SPF/DKIM/DMARC status.
- **`POST /api/analyze/qr`**
  - **Body:** `{ "rawText": "string", "base64Image": "data:image/png;base64,..." }`
  - Decodes payload safely; inspects embedded URLs or UPI payment intents.
- **`POST /api/analyze/attachment`**
  - **Body:** `{ "filename": "string", "mimeType": "string", "fileSize": 12345 }`
  - Checks for deceptive double extensions (.pdf.exe), macro formats, and MIME mismatches.

### 3. AI Copilot
- **`POST /api/chat`**
  - **Body:** `{ "message": "string" }`
  - Returns plain-language advice with prompt-injection defense.

### 4. History & Reports
- **`GET /api/history?page=1&limit=20&scanType=URL&classification=HIGH_RISK`**
- **`GET /api/history/:id`**
- **`DELETE /api/history/:id`**
- **`DELETE /api/history`** (Permanent wipeout)
- **`POST /api/reports/export`** (`{ "scanId": "..." }`)

### 5. Dashboard & Education
- **`GET /api/dashboard`**
- **`GET /api/analytics`**
- **`GET /api/threats`**
- **`GET /api/education`**
- **`GET /api/education/quiz`**
- **`POST /api/education/quiz`** (`{ "answers": { "q1": 1, ... } }`)
