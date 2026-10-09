# CyberShield AI — Architecture Documentation

## System Overview

CyberShield AI is built as a modular, privacy-preserving, multi-tiered cybersecurity platform designed to assist users in detecting and dissecting digital threats across web URLs, mobile SMS/chat messages, business emails, and physical QR codes.

```
+-------------------------------------------------------------------------+
|                        Frontend (React + Vite)                         |
|  14 Responsive Pages, Glassmorphism UI, Recharts, Accessible Risk Bands |
+------------------------------------+------------------------------------+
                                     | JSON REST API
                                     v
+-------------------------------------------------------------------------+
|                        Backend (Node.js + Express)                      |
|  - Security Middleware: Helmet, Strict CORS, Express Rate Limit         |
|  - Validation: Zod schemas for all request payloads                     |
|  - SSRF Defense Engine: RFC1918, Link-local, Cloud Metadata Guard       |
|  - Threat Intelligence Aggregator: URLhaus, Safe Browsing & Local Feed   |
|  - Central Risk Scoring & Evidence Engine (Normalized 0-100)            |
|  - Storage Engine: MongoDB (Mongoose) + Zero-Downtime Memory Fallback   |
+------------------------------------+------------------------------------+
                                     | HTTP /predict (FastAPI)
                                     v
+-------------------------------------------------------------------------+
|                        AI/ML Service (Python + FastAPI)                 |
|  - URL Model: Random Forest (24 lexical & structural features)          |
|  - Message Model: TF-IDF (1,500 n-gram features) + Logistic Regression  |
|  - Confidence Calibration & Feature Importance Extraction               |
|  - Resilient Fallback: Flags rule-based fallback if ML offline          |
+-------------------------------------------------------------------------+
```

## Key Architectural Principles

1. **Defense-in-Depth & Non-Dependency on Single Points of Failure:**
   - If Python AI Service is offline, Node backend seamlessly evaluates using deterministic heuristic cybersecurity rules.
   - If MongoDB is offline, Node backend seamlessly persists scans in an in-memory session store.
   - If external threat intelligence APIs time out, lookups fail closed to local heuristics without crashing.

2. **Server-Side Request Forgery (SSRF) Defense:**
   - The server never visits user-supplied links directly.
   - Static parsing and hostname normalization only.
   - Outbound loopback targets (`127.0.0.1`, `localhost`, `169.254.169.254`, `::1`) are strictly rejected.

3. **Zero-Log Privacy Architecture:**
   - Raw message bodies, passwords, OTPs, PINs, and credit card numbers are never stored in databases.
   - Target queries are hashed with SHA-256 for de-duplication; previews are automatically redacted.
