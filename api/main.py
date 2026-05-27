from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import joblib
import json
import numpy as np
import pandas as pd
import os
from schemas.transactions import TransactionInput, PredictionResponse
from utils.risk_score import get_risk_score, get_risk_tier
from utils.recommendations import get_recommendations

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '..', 'ml', 'models')

ml_model    = None
ml_scaler   = None
ml_features = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_model, ml_scaler, ml_features
    print("Loading ML models...")
    ml_model  = joblib.load(os.path.join(MODEL_DIR, 'xgboost_model.pkl'))
    ml_scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    with open(os.path.join(MODEL_DIR, 'features.json')) as f:
        ml_features = json.load(f)
    print(f"✅ Model loaded | Features: {len(ml_features)}")
    yield
    print("Shutting down...")

app = FastAPI(
    title="UPI Fraud Detection API",
    description="AI-powered UPI fraud detection using XGBoost",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "UPI Fraud Detection API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": ml_model is not None,
        "features_count": len(ml_features) if ml_features else 0
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(transaction: TransactionInput):
    try:
        data = transaction.model_dump()

        if data['amount_log'] is None:
            data['amount_log'] = float(np.log1p(data['amount']))
        if data['is_high_value'] is None:
            data['is_high_value'] = 1 if data['amount'] > 45000 else 0
        if data['user_tx_mean_amount'] is None:
            data['user_tx_mean_amount'] = data['amount']

        input_df = pd.DataFrame([{f: data.get(f, 0) for f in ml_features}])
        input_df = input_df.replace([np.inf, -np.inf], 0).fillna(0)

        input_scaled = ml_scaler.transform(input_df)

        fraud_proba     = float(ml_model.predict_proba(input_scaled)[0][1])
        is_fraud        = fraud_proba >= 0.5
        risk_score      = get_risk_score(fraud_proba)
        risk_tier       = get_risk_tier(fraud_proba)
        recommendations = get_recommendations(risk_tier)

        return PredictionResponse(
            is_fraud=is_fraud,
            fraud_probability=round(fraud_proba, 4),
            risk_score=risk_score,
            risk_tier=risk_tier,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommendations/{risk_tier}")
def recommendations(risk_tier: str):
    if risk_tier not in ["Low", "Medium", "High"]:
        raise HTTPException(status_code=400, detail="risk_tier must be Low, Medium, or High")
    return {
        "risk_tier": risk_tier,
        "recommendations": get_recommendations(risk_tier)
    }

@app.get("/model-info")
def model_info():
    return {
        "model_type": "XGBoost Classifier",
        "features": ml_features,
        "feature_count": len(ml_features),
        "accuracy": 97.04,
        "precision": 95.42,
        "recall": 87.02,
        "f1_score": 91.02,
        "roc_auc": 0.9591
    }