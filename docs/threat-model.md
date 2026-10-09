# CyberShield AI — Threat Model (STRIDE Methodology)

| Threat Category | Potential Attack Vector | CyberShield AI Defensive Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Adversary attempts to mimic authentic banking domains or legitimate sender display names. | Multi-tier brand impersonation heuristics; public suffix domain verification; DKIM/SPF/DMARC cryptographic validation checks. |
| **Tampering** | Attacker tampers with request bodies or submits modified risk scores. | Strict server-side risk computation; client-supplied scores are completely ignored; Zod input boundary validation. |
| **Repudiation** | User denies having inspected a suspicious communication. | Optional persistent scan audit log with cryptographic SHA-256 hashes and ISO-8601 timestamps. |
| **Information Disclosure** | Leakage of private user OTPs, passwords, or emails from backend databases. | Zero-Log architectural guarantee. Inputs are hashed and truncated before database persistence. |
| **Denial of Service** | Volumetric flooding of analysis endpoints or CPU exhaustion via oversized inputs. | Express Rate Limiting (150 requests/min per IP); 10MB payload cap; quick timeouts on microservice calls. |
| **Elevation of Privilege / SSRF** | Attacker supplies internal loopback (`127.0.0.1`, `169.254.169.254`) attempting server-side request forgery. | SSRF guard module actively blocks RFC 1918 subnets, cloud metadata endpoints, and IPv6 loopback addresses. |
| **Prompt Injection** | Attacker embeds jailbreaks or system overrides in analyzed messages to hijack the AI Copilot. | Defensive filtering regexes; untrusted data treated as data only, never instructions; strict safety guardrails. |
