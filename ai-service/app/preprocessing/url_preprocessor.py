"""
URL Preprocessing and Normalization Module
Standard-compliant parsing and normalization for URL analysis.
"""
import re
from urllib.parse import urlparse, parse_qs, unquote
from typing import Dict, Any, Optional

COMMON_TLDS = {
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'io', 'ai', 'co', 'in',
    'uk', 'de', 'jp', 'ca', 'au', 'fr', 'cn', 'br', 'xyz', 'top', 'online',
    'site', 'club', 'info', 'biz', 'vip', 'shop', 'buzz', 'work', 'live'
}

SUSPICIOUS_TLDS = {
    'xyz', 'top', 'work', 'buzz', 'click', 'link', 'gq', 'ml', 'cf', 'tk',
    'ga', 'icu', 'cam', 'rest', 'fit', 'sbs', 'cfd', 'monster', 'hair'
}

POPULAR_BRANDS = [
    'paypal', 'google', 'apple', 'microsoft', 'amazon', 'netflix', 'facebook',
    'instagram', 'whatsapp', 'chase', 'wellsfargo', 'bankofamerica', 'citibank',
    'sbi', 'hdfc', 'icici', 'axisbank', 'binance', 'coinbase', 'dropbox'
]

def normalize_url(raw_url: str) -> str:
    """Normalize user input to a standard URL format without fetching."""
    url = raw_url.strip()
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', url):
        # Default to http:// for parsing if no scheme provided
        url = 'http://' + url
    return url

def parse_url_safely(raw_url: str) -> Dict[str, Any]:
    """
    Safely parse URL without network lookups.
    Returns structured breakdown.
    """
    normalized = normalize_url(raw_url)
    try:
        parsed = urlparse(normalized)
    except Exception:
        # Fallback basic split
        return {
            "valid": False,
            "raw": raw_url,
            "normalized": normalized,
            "error": "Failed to parse URL syntax"
        }

    netloc = parsed.netloc.lower()
    # Strip port if present
    hostname = netloc.split(':')[0]
    
    # Punycode detection
    has_punycode = 'xn--' in hostname or 'xn--' in parsed.path
    
    # Check if host is raw IP address
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    is_ip = bool(re.match(ip_pattern, hostname))
    
    # Split domain into subdomains and registered domain
    parts = hostname.split('.')
    subdomains = []
    registered_domain = hostname
    tld = parts[-1] if parts else ''
    
    if len(parts) >= 2:
        # Check two-part TLDs like co.uk, gov.in
        if len(parts) >= 3 and len(parts[-1]) <= 3 and parts[-2] in ('co', 'com', 'gov', 'org', 'ac', 'edu', 'net'):
            tld = f"{parts[-2]}.{parts[-1]}"
            registered_domain = f"{parts[-3]}.{tld}"
            subdomains = parts[:-3]
        else:
            tld = parts[-1]
            registered_domain = f"{parts[-2]}.{parts[-1]}"
            subdomains = parts[:-2]
            
    query_params = parse_qs(parsed.query)

    return {
        "valid": True,
        "raw": raw_url,
        "normalized": normalized,
        "scheme": parsed.scheme,
        "hostname": hostname,
        "registered_domain": registered_domain,
        "subdomains": subdomains,
        "tld": tld,
        "path": parsed.path,
        "query": parsed.query,
        "query_params": query_params,
        "fragment": parsed.fragment,
        "is_ip": is_ip,
        "has_punycode": has_punycode,
        "port": parsed.port
    }
