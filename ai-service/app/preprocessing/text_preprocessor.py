"""
Text Preprocessing Module
Extracts security-sensitive indicators and cleans message text.
"""
import re
from typing import Dict, Any, List

def clean_text_for_model(text: str) -> str:
    """Basic cleaning for TF-IDF vectorization."""
    if not text:
        return ""
    # Lowercase
    cleaned = text.lower()
    # Normalize excessive whitespaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def extract_message_entities(text: str) -> Dict[str, Any]:
    """
    Safely extract sensitive tokens, links, and phone numbers without leakage.
    Returns counts and redacted samples.
    """
    # URL extraction regex
    url_pattern = r'https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?'
    extracted_urls = re.findall(url_pattern, text)
    
    # Phone number pattern (international & domestic)
    phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}'
    extracted_phones = re.findall(phone_pattern, text)
    
    # OTP / verification codes pattern
    otp_matches = re.findall(r'\b(?:\d{4,8}|[A-Z0-9]{6})\b', text)
    has_otp_request = bool(re.search(r'\b(?:otp|one[- ]time password|verification code|pin|cvv|password)\b', text, re.IGNORECASE))
    
    # Financial keywords
    financial_keywords = [
        'bank', 'account', 'credit', 'debit', 'card', 'upi', 'paytm', 'phonepe',
        'gpay', 'transfer', 'refund', 'wire', 'crypto', 'bitcoin', 'usdt', 'wallet'
    ]
    found_financial = [kw for kw in financial_keywords if re.search(r'\b' + kw + r'\b', text, re.IGNORECASE)]
    
    # Urgency keywords
    urgency_keywords = [
        'urgent', 'immediately', 'suspended', 'blocked', 'expires today', 'action required',
        '24 hours', 'limited time', 'warning', 'last chance', 'penalty', 'legal action'
    ]
    found_urgency = [kw for kw in urgency_keywords if re.search(r'\b' + kw + r'\b', text, re.IGNORECASE)]
    
    # Reward/lottery keywords
    reward_keywords = [
        'winner', 'won', 'lottery', 'prize', 'cashback', 'reward', 'gift card',
        'congratulations', 'claim now', 'free iphone', 'bonus'
    ]
    found_reward = [kw for kw in reward_keywords if re.search(r'\b' + kw + r'\b', text, re.IGNORECASE)]
    
    # Impersonation signals
    impersonation_keywords = [
        'customer support', 'helpdesk', 'security team', 'fraud department',
        'police', 'income tax', 'customs', 'courier', 'fedex', 'dhl', 'amazon delivery'
    ]
    found_impersonation = [kw for kw in impersonation_keywords if re.search(r'\b' + kw + r'\b', text, re.IGNORECASE)]

    return {
        "text_length": len(text),
        "word_count": len(text.split()),
        "extracted_urls": extracted_urls,
        "extracted_phones": extracted_phones,
        "has_otp_request": has_otp_request,
        "found_financial": found_financial,
        "found_urgency": found_urgency,
        "found_reward": found_reward,
        "found_impersonation": found_impersonation
    }
