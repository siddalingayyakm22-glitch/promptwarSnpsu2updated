"""
Model Training and Evaluation Script
Trains Random Forest model for URL Phishing and TF-IDF + Logistic Regression for Scam Messages.
Saves joblib pipelines and true, measured evaluation metrics.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, brier_score_loss
)

from app.feature_extraction.url_features import extract_url_feature_dict, get_feature_vector, FEATURE_COLUMNS
from app.training.data_loader import load_url_dataset, load_message_dataset

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))

def train_url_phishing_model():
    print("[1/2] Training URL Phishing Detector...")
    df = load_url_dataset()
    
    # Feature extraction
    X = []
    for url in df["url"]:
        feat_dict = extract_url_feature_dict(url)
        X.append(get_feature_vector(feat_dict))
        
    X = np.array(X)
    y = df["label"].values
    
    # Stratified 80/20 Train-Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=3,
        random_state=42
    )
    rf.fit(X_train, y_train)
    
    # Predictions & probabilities on held-out test set
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)[:, 1]
    
    # Measured metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)
    brier = brier_score_loss(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    # [[TN, FP], [FN, TP]]
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    
    # Feature importances
    importances = dict(zip(FEATURE_COLUMNS, [round(float(v), 4) for v in rf.feature_importances_]))
    sorted_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    
    metadata = {
        "model_name": "CyberShield URL Phishing Classifier (Random Forest)",
        "model_type": "RandomForestClassifier",
        "version": "1.0.0",
        "training_date": datetime.now(timezone.utc).isoformat(),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "feature_count": len(FEATURE_COLUMNS),
        "features": FEATURE_COLUMNS,
        "feature_importances": dict(sorted_features[:10]),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "brier_score": round(float(brier), 4),
            "false_positive_rate": round(float(fpr), 4),
            "false_negative_rate": round(float(fnr), 4),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            }
        }
    }
    
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACTS_DIR, "url_model.joblib")
    meta_path = os.path.join(ARTIFACTS_DIR, "url_model_metadata.json")
    
    joblib.dump(rf, model_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"URL Model saved to {model_path}")
    print(f"URL Model Test Metrics: Accuracy={acc:.4f}, Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}")
    return metadata


def train_message_scam_model():
    print("[2/2] Training Message Scam Detector...")
    df = load_message_dataset()
    
    X = np.array(df["message"].tolist(), dtype=object)
    y = np.array(df["label"].tolist(), dtype=int)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # TF-IDF Pipeline + Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1500,
            sublinear_tf=True
        )),
        ("clf", LogisticRegression(
            C=1.5,
            class_weight="balanced",
            random_state=42
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)
    brier = brier_score_loss(y_test, y_prob)
    
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    
    metadata = {
        "model_name": "CyberShield Message Scam Classifier (TF-IDF + Logistic Regression)",
        "model_type": "Pipeline[TfidfVectorizer, LogisticRegression]",
        "version": "1.0.0",
        "training_date": datetime.now(timezone.utc).isoformat(),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "brier_score": round(float(brier), 4),
            "false_positive_rate": round(float(fpr), 4),
            "false_negative_rate": round(float(fnr), 4),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            }
        }
    }
    
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACTS_DIR, "message_model.joblib")
    meta_path = os.path.join(ARTIFACTS_DIR, "message_model_metadata.json")
    
    joblib.dump(pipeline, model_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Message Model saved to {model_path}")
    print(f"Message Model Test Metrics: Accuracy={acc:.4f}, Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}")
    return metadata

if __name__ == "__main__":
    train_url_phishing_model()
    train_message_scam_model()
    print("Training complete! Artifacts saved.")
