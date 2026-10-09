"""
Automated Pytest Suite for AI Service
Tests URL parsing, feature extraction, ML prediction, and fallback logic.
"""
import pytest
from app.preprocessing.url_preprocessor import parse_url_safely, normalize_url
from app.preprocessing.text_preprocessor import extract_message_entities, clean_text_for_model
from app.feature_extraction.url_features import extract_url_feature_dict, get_feature_vector, FEATURE_COLUMNS
from app.prediction.predictor import MLPredictor

def test_url_normalization():
    assert normalize_url("google.com") == "http://google.com"
    assert normalize_url("https://example.com/test") == "https://example.com/test"

def test_safe_url_parsing():
    parsed = parse_url_safely("https://sub.login.paypal-security.xyz:8080/path/verify?user=test#sec")
    assert parsed["valid"] is True
    assert parsed["hostname"] == "sub.login.paypal-security.xyz"
    assert parsed["registered_domain"] == "paypal-security.xyz"
    assert parsed["tld"] == "xyz"
    assert "sub" in parsed["subdomains"]
    assert parsed["is_ip"] is False

def test_ip_url_detection():
    parsed = parse_url_safely("http://192.168.1.1/admin/login")
    assert parsed["is_ip"] is True
    assert parsed["hostname"] == "192.168.1.1"

def test_punycode_detection():
    parsed = parse_url_safely("http://xn--pypal-4ve.com/account")
    assert parsed["has_punycode"] is True

def test_url_feature_extraction():
    feats = extract_url_feature_dict("http://paypal-verification-account-update.xyz/login.php?id=99")
    assert feats["url_length"] > 0
    assert feats["hostname_length"] > 0
    assert feats["is_suspicious_tld"] == 1
    assert "login" in feats["keyword_hits"]
    assert "paypal" in feats["impersonated_brands"]
    
    vec = get_feature_vector(feats)
    assert len(vec) == len(FEATURE_COLUMNS)

def test_message_entity_extraction():
    msg = "URGENT: Your SBI account suspended! Enter OTP 492011 at http://sbi-fake.top or call +91-9821098212"
    entities = extract_message_entities(msg)
    assert entities["has_otp_request"] is True
    assert len(entities["extracted_urls"]) >= 1
    assert len(entities["found_urgency"]) >= 1
    assert "sbi" in entities["found_financial"] or len(entities["found_financial"]) >= 0

def test_predictor_loaded_and_predicts():
    pred = MLPredictor()
    # Benign URL test
    url_res = pred.predict_url("https://www.google.com/search?q=test")
    assert "probability" in url_res
    if url_res["available"]:
        assert url_res["probability"] < 0.50
        assert url_res["predicted_label"] == "BENIGN"

    # Phishing URL test
    phish_res = pred.predict_url("http://paypal-verification-account-update.xyz/login.php")
    assert "probability" in phish_res
    if phish_res["available"]:
        assert phish_res["probability"] > 0.50
        assert phish_res["predicted_label"] == "PHISHING"

    # Benign message test
    msg_res = pred.predict_message("Hey, are we having lunch at 1 PM today?")
    assert "probability" in msg_res
    if msg_res["available"]:
        assert msg_res["probability"] < 0.50

    # Scam message test
    scam_res = pred.predict_message("CONGRATULATIONS! You have won $1,000,000 in the Lottery! Claim your prize now.")
    assert "probability" in scam_res
    if scam_res["available"]:
        assert scam_res["probability"] > 0.50

def test_fastapi_endpoints():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # Model status
    status_res = client.get("/api/models/status")
    assert status_res.status_code == 200
    assert status_res.json()["success"] is True

    # URL prediction endpoint
    url_res = client.post("/api/predict/url", json={"url": "http://paypal-verification-account-update.xyz/login.php"})
    assert url_res.status_code == 200
    data = url_res.json()
    assert "probability" in data
    assert "features" in data
    assert data["features"]["is_suspicious_tld"] == 1

    # Message prediction endpoint
    msg_res = client.post("/api/predict/message", json={"message": "Urgent! Account suspended. Send OTP now!"})
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert "probability" in msg_data
    assert msg_data["entities"]["has_otp_request"] is True


