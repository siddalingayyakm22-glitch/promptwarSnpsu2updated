"""
CyberShield AI Service
FastAPI entrypoint with CORS, healthchecks, and ML prediction endpoints.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="CyberShield AI Prediction Service",
    description="Machine Learning inference service for URL Phishing and Message Scam detection",
    version="1.0.0"
)

# CORS middleware for local Node backend & frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "CyberShield AI ML Engine",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ai-service"}

@app.get("/health/ready")
def health_ready():
    from app.prediction.predictor import predictor
    status = predictor.get_status()
    return {
        "status": "ready",
        "models": status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
