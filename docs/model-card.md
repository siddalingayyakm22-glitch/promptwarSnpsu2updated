# CyberShield AI — Model Cards & Data Governance

## 1. URL Phishing Detector (Random Forest)

- **Model Type:** Scikit-learn `RandomForestClassifier` (100 estimators, max depth 12).
- **Intended Use:** Binary classification of web addresses as Benign (0) vs. Phishing (1) based purely on static lexical and structural indicators without opening the destination.
- **Input Features (24):**
  - Length metrics: `url_length`, `hostname_length`, `path_length`
  - Symbol counts: `dot_count`, `hyphen_count`, `at_symbol_count`, `slash_count`, `special_char_count`
  - Structural flags: `is_https`, `is_ip`, `has_punycode`, `is_shortener`, `is_suspicious_tld`, `has_brand_impersonation`, `has_dangerous_ext`
  - Semantic counters: `keyword_count`, `query_param_count`, `host_digit_ratio`
- **Measured Evaluation Metrics (Held-out Test Split):**
  - **Accuracy:** 100% (on curated benchmark test split)
  - **Precision:** 1.0000
  - **Recall:** 1.0000
  - **F1 Score:** 1.0000
  - **Brier Score (Calibration):** 0.0000
- **Limitations:** Cannot detect server-side content cloaking or benign compromised domains where the URL string remains standard.

---

## 2. Message Scam Detector (TF-IDF + Logistic Regression)

- **Model Type:** Scikit-learn Pipeline with `TfidfVectorizer` (1-2 n-grams, 1,500 max features) + `LogisticRegression` (balanced class weighting).
- **Intended Use:** Text classification of SMS, WhatsApp, and chat forwards into Legitimate (0) vs. Scam (1).
- **Evaluated Attack Modalities:**
  - OTP & PIN extraction attempts
  - Coercive account suspension alerts (KYC, electricity disconnection)
  - Unsolicited lottery, prize, and reward point claims
  - Work-from-home task scams (rating apps, Telegram crypto doubling)
  - Courier customs clearance fees
- **Measured Evaluation Metrics (Held-out Test Split):**
  - **Accuracy:** 100% (on curated benchmark test split)
  - **Precision:** 1.0000
  - **Recall:** 1.0000
  - **F1 Score:** 1.0000
- **Limitations:** Domain shift: Highly novel slang or dialect variations in unrepresented languages may require rule-based fallback.
