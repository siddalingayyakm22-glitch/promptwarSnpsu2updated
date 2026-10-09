from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class URLPredictRequest(BaseModel):
    url: str = Field(..., description="The URL to analyze")

class URLPredictResponse(BaseModel):
    success: bool = True
    available: bool
    model_name: Optional[str] = None
    version: Optional[str] = None
    probability: Optional[float] = None
    predicted_label: Optional[str] = None
    confidence: Optional[float] = None
    features: Dict[str, Any]
    note: Optional[str] = None

class MessagePredictRequest(BaseModel):
    message: str = Field(..., description="The message content to analyze")

class MessagePredictResponse(BaseModel):
    success: bool = True
    available: bool
    model_name: Optional[str] = None
    version: Optional[str] = None
    probability: Optional[float] = None
    predicted_label: Optional[str] = None
    confidence: Optional[float] = None
    entities: Dict[str, Any]
    note: Optional[str] = None

class ModelStatusResponse(BaseModel):
    success: bool = True
    status: Dict[str, Any]
