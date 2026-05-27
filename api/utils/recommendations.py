def get_recommendations(risk_tier: str) -> list:
    if risk_tier == "Low":
        return [
            "Monitor your UPI transaction history regularly.",
            "Never share your UPI PIN or OTP with anyone.",
            "Enable transaction alerts on your bank app.",
            "Use strong and unique UPI PINs.",
            "Verify merchant details before making payments."
        ]
    elif risk_tier == "Medium":
        return [
            "Change your UPI PIN immediately.",
            "Review recent transactions for any unauthorized activity.",
            "Enable two-factor authentication on your bank app.",
            "Contact your bank to temporarily limit transaction amounts.",
            "Do not click on suspicious payment links.",
            "Report suspicious activity to your bank helpline."
        ]
    else:
        return [
            "URGENT: Block your bank account immediately via net banking or bank helpline.",
            "Change your UPI PIN and mobile banking password right now.",
            "Call the Cybercrime Helpline: 1930 immediately.",
            "File a complaint at cybercrime.gov.in with transaction details.",
            "Contact your bank's fraud department to freeze the account.",
            "Collect all transaction evidence (screenshots, IDs) for the complaint.",
            "Inform your nearest police station about the fraud.",
            "Do not make any further UPI transactions until resolved."
        ]