"""
Prediction Engine
Loads trained artifacts and runs URL & Message predictions with confidence calibration.
Gracefully handles missing or unreadable artifacts with clear status indicators.
"""
import os
import json
import joblib
import numpy as np
from typing import Dict, Any, Optional

from app.preprocessing.url_preprocessor import parse_url_safely
from app.preprocessing.text_preprocessor import clean_text_for_model, extract_message_entities
from app.feature_extraction.url_features import extract_url_feature_dict, get_feature_vector, FEATURE_COLUMNS

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))

class MLPredictor:
    def __init__(self):
        self.url_model = None
        self.url_metadata = None
        self.message_model = None
        self.message_metadata = None
        self.load_models()

    def load_models(self):
        """Loads models if available on disk."""
        url_path = os.path.join(ARTIFACTS_DIR, "url_model.joblib")
        url_meta_path = os.path.join(ARTIFACTS_DIR, "url_model_metadata.json")
        msg_path = os.path.join(ARTIFACTS_DIR, "message_model.joblib")
        msg_meta_path = os.path.join(ARTIFACTS_DIR, "message_model_metadata.json")

        if os.path.exists(url_path):
            try:
                self.url_model = joblib.load(url_path)
                if os.path.exists(url_meta_path):
                    with open(url_meta_path, "r", encoding="utf-8") as f:
                        self.url_metadata = json.load(f)
            except Exception as e:
                print(f"Error loading URL model: {e}")
                self.url_model = None

        if os.path.exists(msg_path):
            try:
                self.message_model = joblib.load(msg_path)
                if os.path.exists(msg_meta_path):
                    with open(msg_meta_path, "r", encoding="utf-8") as f:
                        self.message_metadata = json.load(f)
            except Exception as e:
                print(f"Error loading message model: {e}")
                self.message_model = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "url_model_loaded": self.url_model is not None,
            "url_model_version": self.url_metadata.get("version") if self.url_metadata else None,
            "url_model_metrics": self.url_metadata.get("metrics") if self.url_metadata else None,
            "message_model_loaded": self.message_model is not None,
            "message_model_version": self.message_metadata.get("version") if self.message_metadata else None,
            "message_model_metrics": self.message_metadata.get("metrics") if self.message_metadata else None,
        }

    def predict_url(self, raw_url: str) -> Dict[str, Any]:
        """
        Runs feature extraction + ML classification on a URL.
        Returns model probability and feature details.
        """
        features_dict = extract_url_feature_dict(raw_url)
        vector = get_feature_vector(features_dict)
        
        if self.url_model is None:
            return {
                "available": False,
                "model_name": None,
                "probability": None,
                "predicted_label": None,
                "confidence": None,
                "features": features_dict,
                "note": "URL ML model artifact not loaded. Rule-based evaluation active."
            }

        try:
            X = np.array([vector])
            pred = int(self.url_model.predict(X)[0])
            prob = float(self.url_model.predict_proba(X)[0][1])
            # Calibrated confidence (distance from decision boundary)
            confidence = round(abs(prob - 0.5) * 2, 4)

            return {
                "available": True,
                "model_name": self.url_metadata.get("model_name", "RandomForestClassifier"),
                "version": self.url_metadata.get("version", "1.0.0"),
                "probability": round(prob, 4),
                "predicted_label": "PHISHING" if pred == 1 else "BENIGN",
                "confidence": confidence,
                "features": features_dict,
                "note": None
            }
        except Exception as e:
            return {
                "available": False,
                "model_name": None,
                "probability": None,
                "predicted_label": None,
                "confidence": None,
                "features": features_dict,
                "note": f"ML prediction error: {str(e)}"
            }

    def predict_message(self, message: str) -> Dict[str, Any]:
        """
        Runs text cleaning, entity extraction, and ML classification on a message.
        """
        cleaned = clean_text_for_model(message)
        entities = extract_message_entities(message)

        if self.message_model is None:
            return {
                "available": False,
                "model_name": None,
                "probability": None,
                "predicted_label": None,
                "confidence": None,
                "entities": entities,
                "note": "Message ML model artifact not loaded. Rule-based evaluation active."
            }

        try:
            pred = int(self.message_model.predict([cleaned])[0])
            prob = float(self.message_model.predict_proba([cleaned])[0][1])
            confidence = round(abs(prob - 0.5) * 2, 4)

            return {
                "available": True,
                "model_name": self.message_metadata.get("model_name", "TFIDF+LogisticRegression"),
                "version": self.message_metadata.get("version", "1.0.0"),
                "probability": round(prob, 4),
                "predicted_label": "SCAM" if pred == 1 else "LEGITIMATE",
                "confidence": confidence,
                "entities": entities,
                "note": None
            }
        except Exception as e:
            return {
                "available": False,
                "model_name": None,
                "probability": None,
                "predicted_label": None,
                "confidence": None,
                "entities": entities,
                "note": f"ML prediction error: {str(e)}"
            }

# Global singleton
predictor = MLPredictor()
