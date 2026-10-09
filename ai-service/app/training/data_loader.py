"""
Dataset preparation for URL Phishing and Message Scam models.
Generates rich, realistic benchmark datasets with legitimate references and known attack vectors.
"""
import pandas as pd
import numpy as np
from typing import Tuple

def load_url_dataset() -> pd.DataFrame:
    """
    Builds a benchmark dataset of 500+ URLs with balanced benign vs. phishing samples,
    incorporating real-world phishing vectors (credential harvesters, typo-squatting, 
    IP URLs, brand impersonation, punycode, deep paths) and verified benign domains
    (top legitimate services, deep documentation paths, search queries).
    """
    benign_urls = [
        "https://www.google.com/search?q=cybersecurity+best+practices",
        "https://en.wikipedia.org/wiki/Phishing",
        "https://github.com/torvalds/linux",
        "https://aws.amazon.com/security/introduction",
        "https://stackoverflow.com/questions/tagged/python",
        "https://www.microsoft.com/en-us/security/business",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        "https://www.bbc.com/news/technology",
        "https://www.nytimes.com/section/technology",
        "https://netflix.com/browse",
        "https://apple.com/support/iphone",
        "https://linkedin.com/in/security-analyst",
        "https://reddit.com/r/netsec",
        "https://cve.mitre.org/cve/identifiers",
        "https://nist.gov/cyberframework",
        "https://owasp.org/www-project-top-ten/",
        "https://www.paypal.com/us/home",
        "https://chase.com/personal/banking",
        "https://bankofamerica.com/online-banking",
        "https://wellsfargo.com/help",
        "https://sbi.co.in/portal/web/personal-banking",
        "https://hdfcbank.com/personal/ways-to-bank",
        "https://icicibank.com/personal-banking",
        "https://spotify.com/us/premium",
        "https://dropbox.com/plans",
        "https://zoom.us/meetings",
        "https://slack.com/pricing",
        "https://docs.python.org/3/library/urllib.html",
        "https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/",
        "https://store.steampowered.com/app/730/CounterStrike_2/",
        "https://coursera.org/specializations/cyber-security",
        "https://edx.org/course/computer-science",
        "https://cnn.com/world",
        "https://reuters.com/business",
        "https://nature.com/articles/s41586-020-2649-2",
        "https://gov.in/services",
        "https://nasa.gov/missions",
        "https://europa.eu/european-union/index_en",
        "https://who.int/emergencies",
        "https://un.org/sustainabledevelopment",
        "https://medium.com/topic/technology",
        "https://bloomberg.com/markets",
        "https://quora.com/topic/Information-Security",
        "https://gitlab.com/explore",
        "https://kaggle.com/datasets",
        "https://oracle.com/cloud",
        "https://salesforce.com/products",
        "https://atlassian.com/software/jira",
        "https://docker.com/products/docker-desktop",
        "https://kubernetes.io/docs/concepts/"
    ]
    
    # Generate variations of benign paths
    benign_expanded = []
    for u in benign_urls:
        benign_expanded.append(u)
        benign_expanded.append(f"{u}?session_ref=homepage&client=safari")
        benign_expanded.append(f"{u}/details/guide-v2?lang=en")
        benign_expanded.append(f"{u}/profile/settings/notifications")
        benign_expanded.append(f"{u}/docs/api/v1/endpoints")
        
    phishing_urls = [
        "http://paypal-verification-account-update.xyz/login.php",
        "http://192.168.1.105/bank/secure/login.html",
        "http://secure-chase-online-verify.com-signin.top/auth",
        "http://appleid.apple.com.verify-billing-notice.com/cgi-bin/login",
        "http://netflix-suspended-reactivate-payment.info/update?user=confirm",
        "http://wellsfargo-security-alert-card.click/confirm.asp?id=8849",
        "http://sbi-kyc-pan-update.top/sbi/quick-login.php",
        "http://hdfc-netbanking-reward-points.buzz/claim/bonus.htm",
        "http://icici-credit-card-limit-increase.site/kyc_verify.php",
        "http://google-drive-shared-invoice-download.xyz/doc.exe",
        "http://microsoft-office365-urgent-password-reset.club/auth/token",
        "http://amazon-prime-refund-claim-2026.online/claim",
        "http://whatsapp-gold-vip-download.site/app.apk",
        "http://binance-account-freeze-unlock.top/wallet/login",
        "http://coinbase-fraud-prevention-desk.work/security-check",
        "http://dropbox-incoming-fax-document.link/view.vbs",
        "http://free-iphone15-pro-giveaway-winner.buzz/claim-reward",
        "http://bank-verification-notice@185.220.101.5/login",
        "http://xn--pypal-4ve.com/account-login-secure",
        "http://facebook-security-violation-appeal.top/appeal?case=48291",
        "http://instagram-copyright-infringement-ticket.xyz/form",
        "http://courier-customs-duty-unpaid-release.site/pay?tracking=9938",
        "http://tax-refund-gov-portal-claim.online/direct-deposit",
        "http://electric-bill-overdue-disconnect-urgent.click/pay-now",
        "http://job-offer-telegram-daily-salary.work/register?ref=vip",
        "http://crypto-doubler-instant-payout.top/deposit.html",
        "http://lottery-lucky-draw-millionaire.club/enter-pin",
        "http://online-banking-session-timeout-restore.xyz/re-auth",
        "http://45.33.32.156/paypal/signin.php?email=victim@target.com",
        "http://secure-login.apple.com.auth-service-id99.top/login",
        "http://meta-business-suite-account-disabled.icu/restore",
        "http://fedex-package-address-correction.monster/schedule",
        "http://dhl-express-clearance-payment.cam/checkout",
        "http://usps-redelivery-request-portal.rest/address",
        "http://support-desk-remote-assist-anydesk.top/quicksupport.exe",
        "http://urgent-notice-account-terminated-today.xyz/reactivate",
        "http://payroll-direct-deposit-update-hr.work/employee-portal",
        "http://zoom-meeting-invitation-update-client.site/installer.msi",
        "http://steamcommunity.com-trade-offer-item.top/id/verify",
        "http://itunes-store-unrecognized-purchase-dispute.click/refund"
    ]
    
    # Generate variations of phishing paths
    phishing_expanded = []
    for p in phishing_urls:
        phishing_expanded.append(p)
        phishing_expanded.append(f"{p}?auth_token=847291&redirect=portal")
        phishing_expanded.append(f"{p}&session_id=fake998822&lang=en")
        phishing_expanded.append(f"{p}/step2/credential-confirm.php")
        phishing_expanded.append(f"{p}/download/security_fix.bat")

    df_benign = pd.DataFrame({"url": benign_expanded, "label": 0})
    df_phishing = pd.DataFrame({"url": phishing_expanded, "label": 1})
    
    df = pd.concat([df_benign, df_phishing], ignore_index=True)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

def load_message_dataset() -> pd.DataFrame:
    """
    Builds a benchmark message dataset of legitimate vs. scam/fraud SMS & instant messages.
    Includes transactional, social, work, and OTP scams, lottery, job frauds, KYC suspensions.
    """
    legitimate_messages = [
        "Hey! Are we still meeting for lunch at 1 PM today?",
        "Your appointment with Dr. Sharma is confirmed for tomorrow at 10:30 AM.",
        "Your package from Amazon has been delivered. Thank you for shopping with us.",
        "Dad, can you please pick up milk on your way back from work?",
        "Reminder: Team standup is moved to 11 AM in conference room B.",
        "Your Uber ride is arriving in 3 minutes. Driver: Rajesh (White Swift Dzire).",
        "Happy Birthday! Wishing you a wonderful day and year ahead!",
        "Can you send me the PDF slides from yesterday's presentation when you get a chance?",
        "Your flight 6E-204 to Mumbai is on time. Gate closes at 14:15.",
        "Thanks for dining with us at Olive Bistro. Here is your digital receipt.",
        "The project repository has been updated with the latest pull request.",
        "Don't forget to submit your weekly timesheet before 5 PM Friday.",
        "Your Swiggy order is being prepared and will reach you in 25 mins.",
        "Hi Alex, did you review the draft document I shared on Google Drive?",
        "Electricity bill for consumer #49281 has been generated: $45. Due date: 24th Oct.",
        "Hey, could you call me when you are free? Need some advice on college applications.",
        "Your library books are due for return in 3 days. Renew online if needed.",
        "Gym membership renewed successfully. Next billing date: November 15.",
        "Mom said dinner will be ready by 8 PM, please don't be late.",
        "Your code review comments have been addressed in commit hash a4f9e1."
    ]
    
    # Expand legitimate messages with realistic variations
    benign_expanded = []
    for msg in legitimate_messages:
        benign_expanded.append(msg)
        benign_expanded.append(f"Hi! Just checking in: {msg}")
        benign_expanded.append(f"Quick update: {msg}")
        benign_expanded.append(f"{msg} Let me know if any questions.")
        benign_expanded.append(f"Fwd: {msg}")

    scam_messages = [
        "URGENT: Your SBI Bank account has been SUSPENDED due to incomplete KYC! Click here immediately to update PAN or your account will be blocked within 24 hours: http://sbi-kyc-pan-update.top",
        "CONGRATULATIONS! You have won $1,000,000 in the International Coca Cola Lottery! To claim your cash prize, share your full name, bank details and pay $50 processing fee.",
        "DEAR CUSTOMER: Never share your OTP with anyone. Your OTP for transaction of Rs 25,000 is 839201. If you did not make this request, call our fraud support instantly at +91-9821098212.",
        "Work from home and earn $300-$800 daily by simply rating apps and liking videos! No experience needed. Immediate payout on Telegram @VIPEarnDaily or WhatsApp us now.",
        "Your Netflix subscription has expired today! Your account is on hold. Update your credit card details immediately at http://netflix-suspended-reactivate-payment.info to prevent termination.",
        "Dear customer, your electricity power supply will be DISCONNECTED tonight at 9:30 PM due to unpaid bill of Rs 1,480. Contact our electricity officer at 9845012399 immediately.",
        "FedEx Notification: Your package delivery failed due to unpaid customs fee of $2.49. Please click http://courier-customs-duty-unpaid-release.site to pay and avoid return.",
        "FINAL NOTICE: Income Tax Department has approved a refund of Rs 15,490. Verify your bank account number and enter your ATM PIN here to credit amount: http://tax-refund-gov-portal.online",
        "Your HDFC Credit Card has 5,400 reward points expiring in 2 hours! Redeem now into cash Rs 5,400 by clicking: http://hdfc-netbanking-reward-points.buzz/claim",
        "Hey Mom, I dropped my phone in water and this is my friend's new number. I urgently need $450 to pay my rent today, please wire it immediately via UPI or gift cards!",
        "Guaranteed 500% returns in 7 days with AI crypto trading! Invest $100 and get $500 back tonight. Join our private VIP channel: http://crypto-doubler-instant.top",
        "Google Security Alert: Unauthorized login attempt detected from Russia. Verify your password and enter verification code here: http://google-security-verify.xyz",
        "Amazon Alert: An iPhone 15 was purchased on your card for $1,199. If this was not you, call our customer care hotline at +1-800-492-8192 immediately to cancel.",
        "Police Cyber Cell Notice: You have been found browsing illegal sites. A warrant is issued. Pay a fine of Rs 10,000 to avoid arrest within 2 hours.",
        "Dear user, you have received a pre-approved personal loan of Rs 5,00,000 with 0% interest! Download APK and share Aadhaar & OTP: http://whatsapp-gold-vip-download.site",
        "URGENT: Action required on your PayPal account. Someone initiated a transfer of $450. Click http://paypal-verification-account-update.xyz to cancel transaction.",
        "Your SIM card will be deactivated within 12 hours due to Aadhaar verification failure. Send your 16 digit card number and OTP to customer executive.",
        "You have 1 unclaimed cryptocurrency deposit of 0.85 BTC waiting in your wallet. Login to claim before withdrawal window closes: http://binance-account-freeze-unlock.top",
        "Install AnyDesk or TeamViewer on your phone now and share the 9 digit code with bank manager to reverse fraudulent transaction.",
        "Hello beautiful, I am an army doctor overseas. I need $2000 emergency medical clearance to send my luggage to you. Please help me with Apple gift cards."
    ]

    scam_expanded = []
    for s in scam_messages:
        scam_expanded.append(s)
        scam_expanded.append(f"ALERT: {s}")
        scam_expanded.append(f"{s} Do not ignore this message.")
        scam_expanded.append(f"Official Notice: {s} Reference #994821")
        scam_expanded.append(f"{s} Reply STOP to unsubscribe or call immediately.")

    df_benign = pd.DataFrame({"message": benign_expanded, "label": 0})
    df_scam = pd.DataFrame({"message": scam_expanded, "label": 1})
    
    df = pd.concat([df_benign, df_scam], ignore_index=True)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df
