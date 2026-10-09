# CyberShield AI

**Tagline:** Detect the Threat. Understand the Risk. Stay Safe.  
**Project Type:** AI-Powered Cybersecurity, Digital Safety, Threat Intelligence, and Scam Detection Platform.

---

## 🌟 Executive Overview & Problem Statement

Digital deception is escalating rapidly across web browsing, instant messaging (WhatsApp, SMS), business emails, and physical QR codes. Malicious actors orchestrate credential harvesters, coercive banking threats, lottery lures, fake job advertisements, and quishing (QR phishing) attacks that victimize millions daily.

**CyberShield AI** is an explainable decision-support web application that answers four critical questions for every investigation:
1. **What kind of threat might this be?** (e.g. Credential harvester, smishing, invoice fraud, or quishing redirection)
2. **How serious is the risk?** (Calibrated 0–100 score mapped to Safe [0–30], Suspicious [31–60], High Risk [61–100])
3. **What evidence supports this assessment?** (Transparent breakdown separating observed facts, heuristic flags, ML model probabilities, and threat intelligence matches)
4. **What should the user do next?** (Context-sensitive mitigation steps, official helpline numbers such as 1930 in India, and credential recovery protocols)

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 19 + TypeScript + Vite
  - Modern Custom CSS Design System (Sleek dark cybersecurity aesthetic, responsive layouts, glassmorphism)
  - React Router DOM
  - Recharts (Interactive SVG data analytics)
  - Lucide Icons
- **Backend:**
  - Node.js (v20+) + Express.js
  - Zod Request Validation
  - Helmet & Rate Limiting
  - Zero-Downtime Resilience: Works with MongoDB or seamless In-Memory fallback
  - Strict SSRF Defense (RFC 1918, link-local, cloud metadata IP guards)
- **AI / ML Microservice:**
  - Python 3.11+ / 3.13+ + FastAPI + Uvicorn
  - Scikit-learn, Pandas, NumPy, Joblib
  - URL Phishing Model: Random Forest Classifier (24 lexical & structural features)
  - Message Scam Model: TF-IDF Vectorizer + Logistic Regression (1,500 features)
  - Pytest Automated Test Suite
- **Threat Intelligence & Safe Feeds:**
  - URLhaus & Google Safe Browsing API connector abstractions with in-memory TTL caching
  - Curated community phishing domain blocklist

---

## 🏗️ Architecture Pipeline

```
User Input (URL, Message, Email, QR Code)
   │
   ▼
[1] Validation & SSRF Guard (Block localhost, 127.0.0.1, 169.254.169.254, private subnets)
   │
   ▼
[2] Lexical & Structural Feature Extraction (Punycode, TLDs, Brand Mismatch, Urgency, OTPs)
   │
   ▼
[3] Machine Learning Inference (FastAPI: Random Forest & TF-IDF + Logistic Regression)
   │
   ▼
[4] Cybersecurity Heuristics Rule Engine (Deterministic attack signatures)
   │
   ▼
[5] Threat Intelligence Check (URLhaus / Local Cached Blocklist)
   │
   ▼
[6] Risk Scoring Aggregation (Normalized 0–100 score & bands)
   │
   ▼
[7] Explainable Evidence Formulation (Facts, Heuristics, ML Probability, Intel)
   │
   ▼
[8] Actionable Safety Recommendations (1930 Indian cybercrime portal, bank freezes)
   │
   ▼
[9] Privacy-Preserving Audit Log (SHA-256 hash storage; zero sensitive credential retention)
```

---

## 🚀 Quick Start & Local Setup (Windows PowerShell)

### Prerequisites
- Node.js (v18+)
- Python (3.10+) with `pip`
- Git

### 1. Clone Repository & Install Dependencies
Open Windows PowerShell in the project directory:

```powershell
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Python AI dependencies
cd ai-service
pip install -r requirements.txt
cd ..
```

### 2. Train the Machine Learning Models
Generate the calibrated model artifacts and true measured benchmark metrics:

```powershell
cd ai-service
python -m app.training.train_models
python -m app.evaluation.evaluate
cd ..
```

### 3. Launch All 3 Services Concurrently
You can launch everything using the provided PowerShell script:

```powershell
.\scripts\start-all.ps1
```

Or open 3 separate PowerShell terminals:

- **Terminal 1 (AI Service):**
  ```powershell
  cd ai-service
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Terminal 2 (Backend):**
  ```powershell
  cd backend
  npm start
  ```
- **Terminal 3 (Frontend):**
  ```powershell
  cd frontend
  npm run dev
  ```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

Both the backend and AI microservice include automated test suites.

### Run Python Pytest Suite
```powershell
cd ai-service
python -m pytest app/tests
```
*Expected: 7 passed*

### Run Backend Integration Tests
```powershell
cd backend
npm test
```
*Expected: 8 passed*

### Test Frontend Production Build
```powershell
cd frontend
npm run build
```
*Expected: Successful compilation to `dist/`*

---

## ⚡ 10 Ready-to-Test Security Demonstrations

Click the **"Test 10 Demos"** button on the top navigation bar to test pre-configured scenarios:
1. **Benign Search URL:** Standard Google HTTPS query (`SAFE`).
2. **Suspicious Login URL:** PayPal credential harvester hosted on an unrelated `.xyz` domain (`HIGH_RISK`).
3. **Lottery Prize Scam:** Unsolicited Coca-Cola lottery message demanding bank details (`HIGH_RISK`).
4. **Bank KYC & OTP Scam:** Coercive SBI suspension threat coercing OTP entry (`HIGH_RISK`).
5. **Telegram Task Scam:** Work-from-home app rating scam requiring crypto deposit (`SUSPICIOUS`).
6. **Courier Customs Delivery Scam:** Fake FedEx customs fee redirection (`HIGH_RISK`).
7. **Email Display-Name Spoof:** Attacker disguising as "PayPal Security" from a random Gmail/xyz sender.
8. **Malicious QR Code (Quishing):** Encoded QR image directing to a Netflix credential harvester.
9. **AI Voice Impersonation Call:** Distress scenario testing the Copilot assistant.
10. **Ambiguous / Insufficient Evidence:** Short vague text demonstrating calibrated uncertainty.

---

## 🌐 Complete Application Pages

1. **Home / Overview (`/`):** Hero, product promise, live metrics, and quick action cards.
2. **URL Scanner (`/scan-url`):** Lexical parsing, punycode detection, brand checks, threat intel.
3. **Message Scam Detector (`/scan-message`):** SMS & WhatsApp analysis, OTP theft detection, urgency flags.
4. **Email Security Analyzer (`/scan-email`):** Display-name spoofing, reply-to routing, SPF/DKIM/DMARC headers.
5. **QR Code Scanner (`/scan-qr`):** Quishing decoder, UPI intent inspection (`upi://pay`), safe preview.
6. **AI Security Copilot (`/copilot`):** Chat assistant with prompt-injection defense and plain-language guidance.
7. **Security Dashboard (`/dashboard`):** Real-time database telemetry, threat categories, risk distribution pie chart.
8. **Scan History (`/history`):** Filterable audit log, individual deletion, complete data wipe, report export.
9. **Threat Intelligence Explorer (`/threats`):** Provider status, domain reputation query, limitation notices.
10. **Learn Cyber Safety (`/learn`):** Educational cards and interactive 4-question scam quiz with explanations.
11. **Incident Response Assistant (`/incident-response`):** Interactive checklists for clicked links, shared OTPs, and **India 1930 / cybercrime.gov.in** reporting.
12. **Privacy and Settings (`/privacy`):** Zero-log disclosures, retention selection, permanent data purge.
13. **About / Methodology (`/about`):** Architecture pipeline, Random Forest & TF-IDF model cards, scoring weights.
14. **404 Route Not Found (`*`):** Friendly fallback navigation.

---

## 🔒 Privacy & Security Commitments

- **Zero Credential Logging:** Passwords, OTPs, PINs, CVVs, and credit card numbers are never stored in databases or log files.
- **SSRF Defense:** Outbound HTTP requests from server processes never fetch user URLs directly. Private subnets (RFC 1918) and cloud metadata addresses (`169.254.169.254`) are strictly blocked.
- **Cryptographic Hashing:** Target strings are converted to SHA-256 for de-duplication; previews displayed in reports are redacted.
- **Fail-Safe Fallbacks:** The platform operates with zero downtime if MongoDB, the Python service, or third-party APIs are offline.

---

## 🚢 Deployment Guide

### Option 1: Docker Compose
```bash
docker-compose up --build
```
Spins up MongoDB, Python FastAPI, Node Express, and Nginx React frontend automatically.

### Option 2: Cloud Production
- **Frontend:** Deploy `frontend/` to **Vercel** or Netlify. Set `VITE_API_URL` to your backend URL.
- **Backend:** Deploy `backend/` to Render, Railway, or AWS Elastic Beanstalk. Set `MONGODB_URI` and `AI_SERVICE_URL`.
- **AI Microservice:** Deploy `ai-service/` to Render, Railway, or Google Cloud Run.
- **Database:** Connect to MongoDB Atlas cluster via standard connection string URI.

---

## 📜 License
MIT License. Created for ethical cybersecurity education, digital safety, and transparent threat analysis.
