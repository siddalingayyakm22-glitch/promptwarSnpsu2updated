/**
 * AI Security Copilot Service
 * Context-aware cybersecurity assistant with prompt-injection defense,
 * guardrails against sensitive credential collection, and intelligent deterministic reasoning.
 */

// Prompt injection patterns to neutralize
const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior)\s+(?:instructions|prompts)/i,
  /disregard\s+(?:all\s+)?(?:earlier|previous)\s+(?:prompts|instructions)/i,
  /system\s+(?:override|prompt|instructions)/i,
  /(?:you\s+are\s+(?:now\s+in|in)|switch\s+to|enter)\s+(?:developer|dan|jailbreak|unrestricted)\s+mode/i,
  /developer\s+mode\s+now/i,
  /reveal\s+(?:your\s+)?(?:system|internal|developer)\s+(?:instructions|prompt)/i,
  /bypass\s+(?:safety|content|passwords)\s+(?:filters|guardrails)?/i,
  /print\s+(?:the\s+)?(?:hidden|initial|original)\s+instructions/i,
  /act\s+as\s+(?:an?\s+)?(?:evil|malicious|unrestricted)\s+ai/i,
  /forget\s+(?:everything|your\s+identity|all\s+rules)/i,
  /simulate\s+(?:a\s+)?jailbreak/i,
  /give\s+me\s+(?:credentials|passwords|admin\s+access)/i
];

const EXPERT_KNOWLEDGE_BASE = [
  {
    keywords: ['otp', 'one time password', 'pin', 'verification code'],
    response: `### 🛡️ Immediate Safety Advice: OTP & Verification Codes

**Critical Rule:** **Never share your OTP, PIN, or CVV with anyone** — including anyone claiming to be a bank manager, police officer, or customer support agent.

1. **Why they asked:** Scammers use OTPs to authorize money transfers, change login passwords, or register your mobile number on a new device.
2. **What to do immediately:**
   - Do **NOT** reply or provide the digits.
   - If you already shared an OTP: Contact your bank fraud helpline immediately (or dial **1930** if in India) to block the debit card, UPI, or net banking account.
   - Review your account statements for unauthorized withdrawals.`
  },
  {
    keywords: ['clicked link', 'clicked a link', 'opened link', 'suspicious link', 'clicked url'],
    response: `### 🚨 What To Do If You Clicked a Suspicious Link

1. **Did you submit any passwords or credentials?**
   - **YES:** From a separate clean device, change your password for that account immediately. Enable Multi-Factor Authentication (MFA).
2. **Did your device download a file automatically?**
   - Do **NOT** open or run any downloaded file (.exe, .apk, .zip). Delete it immediately from your Downloads folder.
3. **Did you enter payment details?**
   - Call your card issuer immediately to freeze the card and dispute any unauthorized charges.
4. **General Precaution:** Run a full scan using your system antivirus software (e.g. Windows Defender) and clear browser cookies.`
  },
  {
    keywords: ['bank', 'account suspended', 'kyc', 'pan', 'blocked'],
    response: `### 🏦 Verifying Bank Account & KYC Alerts

1. **Don't use links or phone numbers from the SMS:** Scammers create fake lookalike login portals to steal net banking user IDs and passwords.
2. **Verify via the official app:** Open your official banking mobile app directly from your home screen, or type the bank's well-known URL manually into your browser.
3. **Banks do not block accounts by text:** Genuine banks never threaten immediate 24-hour disconnection over SMS without prior formal physical or registered notices.`
  },
  {
    keywords: ['job', 'work from home', 'task', 'telegram', 'daily salary'],
    response: `### 💼 Recognizing Fake Job & Task Scams

- **The Hook:** Promising Rs 2,000–5,000 or $200–$500 per day for simple tasks (like rating hotel apps, subscribing to YouTube channels).
- **The Trap:** They pay a small nominal amount (Rs 200–500) initially to build trust, then request you to deposit "prepaid tasks" or "investment funds" to unlock higher commissions.
- **The Reality:** Once you deposit money into their crypto wallet or UPI address, they freeze your "account" and demand more fees. Genuine employers **never** ask employees to pay upfront fees.`
  },
  {
    keywords: ['qr', 'quishing', 'scan qr'],
    response: `### 📱 What is QR Code Phishing (Quishing)?

- **How it works:** Attackers replace or generate QR codes that redirect to deceptive credential-harvesting web pages or initiate direct UPI/wallet debit transactions.
- **Safety checklist:**
  1. Inspect physical QR codes at stores/parking meters for tampering or stickers pasted over genuine signs.
  2. Remember: **Scanning a QR code is for sending money, NEVER for receiving money.**
  3. Preview the decoded URL in your scanner before opening it.`
  },
  {
    keywords: ['deepfake', 'voice', 'fake voice', 'audio call', 'emergency call'],
    response: `### 🎙️ AI Voice Impersonation & Deepfake Scams

- **The Tactic:** Scammers clone a family member, colleague, or CEO's voice using a 5-second audio snippet, then call claiming an emergency (arrest, accident, urgent wire transfer).
- **Verification Rule:**
  1. **Hang up and call back:** Dial the family member or executive on their known saved phone number.
  2. **Family Safe Word:** Agree on a private verification codeword known only to close family members.
  3. **Refuse urgency:** Never wire money or purchase gift cards in response to emotional panic.`
  }
];

async function handleChatQuery({ message = '', previousScans = [], context = {} }) {
  const query = (message || '').trim();
  if (!query) {
    return {
      reply: 'Hello! I am CyberShield Copilot. Ask me how to identify scams, what a URL analysis means, or what immediate steps to take if you suspect a threat.',
      source: 'DETERMINISTIC_RULES'
    };
  }

  // 1. Guard against prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return {
        reply: '⚠️ **Security Notice:** The prompt contained instructions attempting to alter assistant security guidelines. For safety, CyberShield AI strictly adheres to defensive cybersecurity best practices.',
        source: 'SECURITY_GUARD'
      };
    }
  }

  // 2. Guard against sensitive credential collection
  if (/\b(?:password|otp|pin|cvv|secret key)\b/i.test(query) && /\b(?:my (?:password|pin|otp) is|here is my)\b/i.test(query)) {
    return {
      reply: '🛡️ **Privacy Alert:** Please **never enter your real passwords, OTPs, or PINs into any chat interface**, including CyberShield AI. Delete this sensitive data from your clipboard immediately.',
      source: 'CREDENTIAL_PROTECTOR'
    };
  }

  // 3. Match against specialized cybersecurity domain knowledge base
  const queryLower = query.toLowerCase();
  for (const item of EXPERT_KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => queryLower.includes(kw))) {
      return {
        reply: item.response,
        source: 'EXPERT_SECURITY_RULES'
      };
    }
  }

  // 4. Default expert guidance
  return {
    reply: `### 🛡️ CyberShield Digital Safety Advice

You asked: *"${query.slice(0, 100)}"*

When investigating digital communications:
1. **Source Verification:** Never click links provided directly in unexpected messages or emails. Navigate to the verified official portal independently.
2. **Urgency is a Red Flag:** Legitimate entities rarely demand irreversible immediate financial transfers within minutes.
3. **Decision Support:** You can paste the suspicious URL in our **URL Scanner**, message text into our **Message Detector**, or email into our **Email Security Analyzer** for a multi-layered risk breakdown.

*Disclaimer: CyberShield AI is an explainable decision-support advisor. When in doubt regarding financial transactions, contact your official institution directly.*`,
    source: 'RULE_BASED_COPILOT'
  };
}

module.exports = {
  handleChatQuery
};
