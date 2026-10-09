"""
URL Feature Extraction Engine
Extracts 25+ lexical, structural, and semantic features for ML classification
and cybersecurity heuristic evaluation.
"""
import re
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List
from app.preprocessing.url_preprocessor import parse_url_safely, SUSPICIOUS_TLDS, POPULAR_BRANDS

SHORTENER_DOMAINS = {
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly',
    'rebrand.ly', 'cutt.ly', 'shorturl.at', 'rb.gy', 'v.gd', 'qr.net'
}

SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'verify', 'verification', 'update', 'account', 'banking',
    'secure', 'security', 'wallet', 'confirm', 'password', 'credential', 'auth',
    'support', 'billing', 'invoice', 'payment', 'unlock', 'recover', 'free',
    'prize', 'bonus', 'claim', 'kyc', 'reactivate', 'authenticate'
]

DANGEROUS_EXTENSIONS = {
    '.exe', '.scr', '.vbs', '.bat', '.cmd', '.ps1', '.apk', '.jar', '.msi',
    '.dll', '.iso', '.dmg', '.pif', '.hta', '.reg', '.wsf', '.zip', '.tar'
}

def extract_url_feature_dict(raw_url: str) -> Dict[str, Any]:
    """
    Extract comprehensive numerical and boolean features for ML and rule scoring.
    """
    parsed = parse_url_safely(raw_url)
    normalized = parsed["normalized"]
    hostname = parsed["hostname"]
    path = parsed["path"]
    query = parsed["query"]
    
    url_len = len(normalized)
    host_len = len(hostname)
    path_len = len(path)
    
    # Character counts
    dot_count = normalized.count('.')
    host_dot_count = hostname.count('.')
    hyphen_count = normalized.count('-')
    host_hyphen_count = hostname.count('-')
    at_count = normalized.count('@')
    slash_count = normalized.count('/')
    double_slash_in_path = path.count('//')
    subdomain_count = len(parsed["subdomains"])
    
    # Special chars & encoding
    special_char_count = len(re.findall(r'[^a-zA-Z0-9]', normalized))
    has_percent_encoding = '%' in normalized
    percent_count = normalized.count('%')
    
    # Protocol & host checks
    is_https = int(parsed["scheme"].lower() == 'https')
    is_ip = int(parsed["is_ip"])
    has_punycode = int(parsed["has_punycode"])
    is_shortener = int(hostname in SHORTENER_DOMAINS or parsed["registered_domain"] in SHORTENER_DOMAINS)
    is_suspicious_tld = int(parsed["tld"] in SUSPICIOUS_TLDS)
    
    # Keyword analysis
    url_lower = normalized.lower()
    keyword_hits = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    keyword_count = len(keyword_hits)
    
    # Brand impersonation detection: brand in subdomains or path while not in registered domain
    brand_hits = []
    registered_domain = parsed["registered_domain"]
    for brand in POPULAR_BRANDS:
        if brand in hostname or brand in path:
            if not registered_domain.startswith(f"{brand}."):
                brand_hits.append(brand)
    has_brand_impersonation = int(len(brand_hits) > 0)
    
    # File extension check
    has_dangerous_ext = 0
    for ext in DANGEROUS_EXTENSIONS:
        if path.lower().endswith(ext) or ext in query.lower():
            has_dangerous_ext = 1
            break
            
    # Subdomain depth
    has_excessive_subdomains = int(subdomain_count >= 3)
    
    # Digits ratio in hostname
    digit_count = sum(c.isdigit() for c in hostname)
    host_digit_ratio = (digit_count / host_len) if host_len > 0 else 0.0

    # Query param count
    query_param_count = len(parsed["query_params"])

    return {
        # Raw parsed info
        "raw_url": raw_url,
        "normalized": normalized,
        "hostname": hostname,
        "registered_domain": registered_domain,
        "subdomains": parsed["subdomains"],
        "tld": parsed["tld"],
        "path": path,
        "query": query,
        
        # Numerical features for ML Vectorizer
        "url_length": url_len,
        "hostname_length": host_len,
        "path_length": path_len,
        "dot_count": dot_count,
        "host_dot_count": host_dot_count,
        "hyphen_count": hyphen_count,
        "host_hyphen_count": host_hyphen_count,
        "at_symbol_count": at_count,
        "slash_count": slash_count,
        "double_slash_in_path": double_slash_in_path,
        "subdomain_count": subdomain_count,
        "special_char_count": special_char_count,
        "percent_count": percent_count,
        "keyword_count": keyword_count,
        "query_param_count": query_param_count,
        "host_digit_ratio": round(host_digit_ratio, 4),
        
        # Binary flags
        "is_https": is_https,
        "is_ip": is_ip,
        "has_punycode": has_punycode,
        "is_shortener": is_shortener,
        "is_suspicious_tld": is_suspicious_tld,
        "has_brand_impersonation": has_brand_impersonation,
        "has_dangerous_ext": has_dangerous_ext,
        "has_excessive_subdomains": has_excessive_subdomains,
        
        # Details for explanation
        "keyword_hits": keyword_hits,
        "impersonated_brands": brand_hits
    }

FEATURE_COLUMNS = [
    "url_length", "hostname_length", "path_length", "dot_count", "host_dot_count",
    "hyphen_count", "host_hyphen_count", "at_symbol_count", "slash_count",
    "double_slash_in_path", "subdomain_count", "special_char_count", "percent_count",
    "keyword_count", "query_param_count", "host_digit_ratio", "is_https", "is_ip",
    "has_punycode", "is_shortener", "is_suspicious_tld", "has_brand_impersonation",
    "has_dangerous_ext", "has_excessive_subdomains"
]

def get_feature_vector(feature_dict: Dict[str, Any]) -> List[float]:
    """Convert feature dict to float list matching FEATURE_COLUMNS order."""
    return [float(feature_dict.get(col, 0)) for col in FEATURE_COLUMNS]
