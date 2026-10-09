export interface DemoCase {
  id: string;
  title: string;
  category: 'URL' | 'MESSAGE' | 'EMAIL' | 'QR' | 'COPILOT';
  description: string;
  route: string;
  payload: any;
}

export const SAMPLE_DEMO_CASES: DemoCase[] = [
  {
    id: 'demo-1',
    title: '1. Benign Search URL',
    category: 'URL',
    description: 'Legitimate search query on Google with HTTPS and standard parameters.',
    route: '/scan-url',
    payload: {
      url: 'https://www.google.com/search?q=cybersecurity+best+practices'
    }
  },
  {
    id: 'demo-2',
    title: '2. Suspicious Phishing Login URL',
    category: 'URL',
    description: 'Deceptive credential harvester mimicking PayPal on an unauthorized .xyz domain.',
    route: '/scan-url',
    payload: {
      url: 'http://paypal-verification-account-update.xyz/login.php?session_id=882910'
    }
  },
  {
    id: 'demo-3',
    title: '3. Lottery & Prize Scam Message',
    category: 'MESSAGE',
    description: 'Unsolicited international lottery claim requiring personal bank details and upfront fee.',
    route: '/scan-message',
    payload: {
      message: 'CONGRATULATIONS! You have won $1,000,000 in the International Coca Cola Lottery! To claim your cash prize, share your full name, bank details and pay $50 processing fee.'
    }
  },
  {
    id: 'demo-4',
    title: '4. Bank Suspension & OTP Scam',
    category: 'MESSAGE',
    description: 'Coercive SMS threatening account deactivation within 24 hours to steal OTPs.',
    route: '/scan-message',
    payload: {
      message: 'URGENT: Your SBI Bank account has been SUSPENDED due to incomplete KYC! Click here immediately to update PAN or your account will be blocked within 24 hours: http://sbi-kyc-pan-update.top'
    }
  },
  {
    id: 'demo-5',
    title: '5. Fake Job Offer / Telegram Task Scam',
    category: 'MESSAGE',
    description: 'Work-from-home task scam promising daily income for rating apps, leading to crypto fees.',
    route: '/scan-message',
    payload: {
      message: 'Work from home and earn $300-$800 daily by simply rating apps and liking videos! No experience needed. Immediate payout on Telegram @VIPEarnDaily or WhatsApp us now.'
    }
  },
  {
    id: 'demo-6',
    title: '6. Courier Customs Delivery Fee Scam',
    category: 'MESSAGE',
    description: 'Fake FedEx delivery failure notice demanding payment of a nominal fee to release a package.',
    route: '/scan-message',
    payload: {
      message: 'FedEx Notification: Your package delivery failed due to unpaid customs fee of $2.49. Please click http://courier-customs-duty-unpaid-release.site to pay and avoid return.'
    }
  },
  {
    id: 'demo-7',
    title: '7. Email Display-Name Impersonation',
    category: 'EMAIL',
    description: 'Attacker spoofing PayPal Security display name from an unrelated random email address.',
    route: '/scan-email',
    payload: {
      sender: 'notification-alert992@random-gateway.xyz',
      displayName: 'PayPal Security Center',
      replyTo: 'billing-dispute-collector@gmail.com',
      subject: 'Security Alert: Unauthorized login attempt from Russia',
      body: 'Your PayPal account has been temporarily restricted. Verify your credentials immediately to cancel a pending $450 wire transfer.'
    }
  },
  {
    id: 'demo-8',
    title: '8. Malicious Quishing (QR Phishing) Payload',
    category: 'QR',
    description: 'QR code disguised as a parking meter / restaurant menu redirecting to credential harvester.',
    route: '/scan-qr',
    payload: {
      rawText: 'http://netflix-suspended-reactivate-payment.info/update?user=confirm'
    }
  },
  {
    id: 'demo-9',
    title: '9. AI Voice Impersonation Scenario',
    category: 'COPILOT',
    description: 'A distressed phone call claiming a family member had an accident and urgently needs wire funds.',
    route: '/copilot',
    payload: {
      message: 'I received a phone call from someone with my son voice crying saying he got into a car accident and I need to immediately wire Rs 50,000 to an unknown UPI ID. Is this an AI voice scam?'
    }
  },
  {
    id: 'demo-10',
    title: '10. Ambiguous / Insufficient Evidence',
    category: 'MESSAGE',
    description: 'Brief ambiguous message without immediate red flags, illustrating calibrated uncertainty.',
    route: '/scan-message',
    payload: {
      message: 'Hi, are you still interested in discussing the proposal from Tuesday? Let me know.'
    }
  }
];
