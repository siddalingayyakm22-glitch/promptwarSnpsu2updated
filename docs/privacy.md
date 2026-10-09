# CyberShield AI — Privacy Policy & Governance

## 1. Zero-Log Credential Policy
CyberShield AI is intentionally designed to assist users in identifying scams without becoming a target for data theft:
- **No Sensitive Credentials Logged:** Passwords, OTPs, PINs, bank account numbers, and credit card details are strictly excluded from persistent databases and application logs.
- **De-duplication Hashing:** Full user inputs are transformed into SHA-256 hashes for caching and duplicate analysis; only redacted display strings (e.g. hostnames or truncated message snippets) are stored.

## 2. Guest Mode
Full investigative capabilities are provided without requiring user registration, email submission, or OAuth linking.

## 3. Data Subject Rights & Deletion
Users maintain total control over their scan history:
- Individual investigations can be deleted at any time with a single click.
- A "Wipe All Data" action permanently deletes all history records, cached responses, and browser session storage.

## 4. Third-Party Disclosures
No user analytics, trackers, or behavioral profiling services (e.g. Google Analytics, Facebook Pixel) are included in the frontend. External threat lookups (such as URLhaus) only transmit the host domain, never private parameters or message bodies.
