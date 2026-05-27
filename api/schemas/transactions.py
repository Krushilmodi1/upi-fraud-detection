from pydantic import BaseModel
from typing import Optional

class TransactionInput(BaseModel):
    amount: float
    transaction_type: Optional[int] = 0
    device_id: Optional[int] = 0
    location: Optional[int] = 0
    session_duration: Optional[float] = 0.0
    authentication_status: Optional[int] = 1
    pin_entry_method: Optional[int] = 0
    authentication_attempt_count: Optional[int] = 1
    hour_of_day: Optional[int] = 12
    day_of_week: Optional[int] = 0
    is_weekend: Optional[int] = 0
    is_night: Optional[int] = 0
    month: Optional[int] = 1
    amount_log: Optional[float] = None
    is_high_value: Optional[int] = None
    amount_zscore: Optional[float] = 0.0
    user_tx_count: Optional[int] = 1
    user_tx_mean_amount: Optional[float] = None
    amount_vs_user_mean: Optional[float] = 1.0

class PredictionResponse(BaseModel):
    is_fraud: bool
    fraud_probability: float
    risk_score: int
    risk_tier: str
    recommendations: list