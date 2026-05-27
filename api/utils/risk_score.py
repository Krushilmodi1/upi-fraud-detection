def get_risk_tier(fraud_probability: float) -> str:
    score = round(fraud_probability * 100)
    if score <= 30:
        return "Low"
    elif score <= 70:
        return "Medium"
    else:
        return "High"

def get_risk_score(fraud_probability: float) -> int:
    return round(fraud_probability * 100)