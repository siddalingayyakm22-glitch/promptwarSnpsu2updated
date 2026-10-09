const EDUCATION_MODULES = [
  {
    id: 'phishing',
    title: 'Phishing & Fake Login Portals',
    category: 'WEB_SAFETY',
    summary: 'Deceptive websites designed to clone authentic login pages and harvest passwords.',
    signs: [
      'Lookalike domain spelling (e.g. paypa1.com or login.apple.com.secure-update.xyz)',
      'Unusual generic greeting ("Dear Customer")',
      'Artificial urgency ("Account suspended in 24 hours")',
      'Non-HTTPS or self-signed certificate warnings'
    ],
    prevention: [
      'Check the full browser address bar, especially the registered domain',
      'Use a password manager which will never autofill on spoofed domains',
      'Never click login links in unsolicited emails or SMS'
    ]
  },
  {
    id: 'smishing',
    title: 'Smishing & OTP Financial Fraud',
    category: 'MOBILE_SECURITY',
    summary: 'Fraudulent SMS and WhatsApp messages coercing victims into sharing one-time passcodes.',
    signs: [
      'Claims of pending electricity bill disconnect tonight',
      'Fake lottery or reward points redemption',
      'Request to install AnyDesk or TeamViewer to reverse a false charge'
    ],
    prevention: [
      'Banks will never ask for your OTP or PIN over phone or message',
      'Dial official customer care from your bank statement directly'
    ]
  },
  {
    id: 'quishing',
    title: 'QR Code Phishing (Quishing)',
    category: 'PHYSICAL_CYBER',
    summary: 'Malicious QR codes pasted over physical parking meters, restaurant menus, or phishing emails.',
    signs: [
      'QR stickers pasted over original signs',
      'QR code in an email asking to scan to verify multi-factor authentication',
      'QR codes claiming to "receive" money via UPI'
    ],
    prevention: [
      'Scanning a QR code is for sending payments, never for receiving money',
      'Inspect physical QR posters for adhesive overlays before scanning',
      'Preview the decoded URL destination using CyberShield AI'
    ]
  },
  {
    id: 'deepfakes',
    title: 'AI Voice Cloning & Deepfake Scams',
    category: 'EMERGING_AI_THREATS',
    summary: 'Using generative AI audio synthesis to mimic family members or executives demanding urgent wire transfers.',
    signs: [
      'Urgent call from unknown number with familiar voice claiming emergency/arrest',
      'Caller refuses to answer specific private questions',
      'Immediate demand for payment via cryptocurrency or gift cards'
    ],
    prevention: [
      'Hang up immediately and dial the person on their known real number',
      'Establish a secret family safety passphrase',
      'Never transfer funds based on voice or video calls alone'
    ]
  },
  {
    id: 'india-safety',
    title: 'India Cyber Safety & 1930 Helpline Guide',
    category: 'LEGAL_REGULATORY',
    summary: 'Official protocol for financial cybercrime reporting in India under the National Cyber Crime Reporting Portal.',
    signs: [
      'Electricity disconnection threats from personal WhatsApp numbers',
      'Fake APK files shared on WhatsApp (e.g. PM-Yojana.apk, SBI-Rewards.apk)',
      'Digital arrest video calls from fake police stations'
    ],
    prevention: [
      'Dial 1930 immediately within the golden hour to freeze fraudulent bank transfers',
      'File an official report on cybercrime.gov.in with transaction references',
      'Never install APK files sent outside Google Play Store or Apple App Store'
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'You receive an SMS saying your bank account is suspended and you must click a link within 24 hours. What should you do?',
    options: [
      'Click the link quickly to verify your account',
      'Ignore the link and open your official banking app directly or call the bank number on your card',
      'Reply to the SMS with your debit card PIN',
      'Forward the message to all your contacts'
    ],
    correctAnswer: 1,
    explanation: 'Banks never demand immediate credential updates through SMS links. Always navigate directly through your verified bank app.'
  },
  {
    id: 'q2',
    question: 'A buyer on an online marketplace wants to pay you money and sends a QR code saying "Scan this to receive payment". What happens if you scan and enter your UPI PIN?',
    options: [
      'The money will be credited to your account',
      'Your account will be debited (money will be sent to the scammer)',
      'Nothing, UPI PIN is only for identification',
      'The payment will be held in escrow'
    ],
    correctAnswer: 1,
    explanation: 'Entering your UPI PIN ALWAYS debits money from your account. Receiving money NEVER requires entering your UPI PIN.'
  },
  {
    id: 'q3',
    question: 'In India, which official emergency helpline number should be dialed immediately for financial cyber fraud?',
    options: [
      '100',
      '1930',
      '108',
      '112'
    ],
    correctAnswer: 1,
    explanation: '1930 is the dedicated National Cybercrime Helpline operated by the Ministry of Home Affairs to freeze fraudulent bank transactions in the golden hour.'
  },
  {
    id: 'q4',
    question: 'An email displays "Apple Support" as the sender name, but the email address is "security-notice@apple-id-verify.xyz". Is this safe?',
    options: [
      'Yes, because the display name says Apple Support',
      'No, the sender domain is apple-id-verify.xyz, which is an impersonation domain',
      'Yes, .xyz is an official Apple domain',
      'It is safe as long as the email has an Apple logo'
    ],
    correctAnswer: 1,
    explanation: 'Display names can be set to anything. The real sending domain (.xyz) is not an official apple.com property.'
  }
];

async function getEducationHandler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      modules: EDUCATION_MODULES,
      totalModules: EDUCATION_MODULES.length
    },
    error: null
  });
}

async function getQuizHandler(req, res) {
  // Return quiz without showing answers
  const sanitized = QUIZ_QUESTIONS.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  res.status(200).json({
    success: true,
    data: {
      questions: sanitized
    },
    error: null
  });
}

async function submitQuizHandler(req, res) {
  const { answers = {} } = req.body;
  let score = 0;
  const feedback = [];

  for (const q of QUIZ_QUESTIONS) {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) score++;

    feedback.push({
      questionId: q.id,
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    });
  }

  res.status(200).json({
    success: true,
    data: {
      score,
      total: QUIZ_QUESTIONS.length,
      percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100),
      feedback
    },
    error: null
  });
}

module.exports = {
  getEducationHandler,
  getQuizHandler,
  submitQuizHandler,
  EDUCATION_MODULES
};
