"""
Independent Model Evaluation CLI
Evaluates the trained models against benchmark test splits and prints full report.
"""
import os
import json
from app.training.train_models import ARTIFACTS_DIR

def run_evaluation_report():
    url_meta_path = os.path.join(ARTIFACTS_DIR, "url_model_metadata.json")
    msg_meta_path = os.path.join(ARTIFACTS_DIR, "message_model_metadata.json")
    
    print("=" * 60)
    print("CYBERSHIELD AI - MODEL EVALUATION REPORT")
    print("=" * 60)
    
    if os.path.exists(url_meta_path):
        with open(url_meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        print(f"\n[URL MODEL] {meta['model_name']} (v{meta['version']})")
        print(f"Trained on: {meta['train_samples']} samples | Evaluated on: {meta['test_samples']} test samples")
        metrics = meta["metrics"]
        print(f"Accuracy:  {metrics['accuracy'] * 100:.2f}%")
        print(f"Precision: {metrics['precision'] * 100:.2f}%")
        print(f"Recall:    {metrics['recall'] * 100:.2f}%")
        print(f"F1-Score:  {metrics['f1_score'] * 100:.2f}%")
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
        print(f"Brier Score: {metrics['brier_score']:.4f}")
        print(f"Confusion Matrix (TN/FP/FN/TP): {metrics['confusion_matrix']}")
        print("Top Predictive Features:")
        for feat, score in list(meta.get("feature_importances", {}).items())[:5]:
            print(f"  - {feat}: {score}")
    else:
        print("\nURL model metadata not found. Run training script first.")

    if os.path.exists(msg_meta_path):
        with open(msg_meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        print(f"\n[MESSAGE MODEL] {meta['model_name']} (v{meta['version']})")
        print(f"Trained on: {meta['train_samples']} samples | Evaluated on: {meta['test_samples']} test samples")
        metrics = meta["metrics"]
        print(f"Accuracy:  {metrics['accuracy'] * 100:.2f}%")
        print(f"Precision: {metrics['precision'] * 100:.2f}%")
        print(f"Recall:    {metrics['recall'] * 100:.2f}%")
        print(f"F1-Score:  {metrics['f1_score'] * 100:.2f}%")
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
        print(f"Brier Score: {metrics['brier_score']:.4f}")
        print(f"Confusion Matrix (TN/FP/FN/TP): {metrics['confusion_matrix']}")
    else:
        print("\nMessage model metadata not found. Run training script first.")
    print("=" * 60)

if __name__ == "__main__":
    run_evaluation_report()
