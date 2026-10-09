from fastapi import APIRouter, HTTPException
from app.api.schemas import (
    URLPredictRequest, URLPredictResponse,
    MessagePredictRequest, MessagePredictResponse,
    ModelStatusResponse
)
from app.prediction.predictor import predictor

router = APIRouter()

@router.post("/predict/url", response_model=URLPredictResponse)
def predict_url(payload: URLPredictRequest):
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    result = predictor.predict_url(payload.url)
    return URLPredictResponse(
        success=True,
        available=result["available"],
        model_name=result["model_name"],
        version=result.get("version"),
        probability=result["probability"],
        predicted_label=result["predicted_label"],
        confidence=result["confidence"],
        features=result["features"],
        note=result["note"]
    )

@router.post("/predict/message", response_model=MessagePredictResponse)
def predict_message(payload: MessagePredictRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    result = predictor.predict_message(payload.message)
    return MessagePredictResponse(
        success=True,
        available=result["available"],
        model_name=result["model_name"],
        version=result.get("version"),
        probability=result["probability"],
        predicted_label=result["predicted_label"],
        confidence=result["confidence"],
        entities=result["entities"],
        note=result["note"]
    )

@router.get("/models/status", response_model=ModelStatusResponse)
def get_model_status():
    return ModelStatusResponse(
        success=True,
        status=predictor.get_status()
    )
