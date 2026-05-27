const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    transaction_type: { type: Number, default: 0 },
    device_id: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    session_duration: { type: Number, default: 0 },
    authentication_status: { type: Number, default: 1 },
    pin_entry_method: { type: Number, default: 0 },
    authentication_attempt_count: { type: Number, default: 1 },
    hour_of_day: { type: Number, default: 12 },
    day_of_week: { type: Number, default: 0 },
    is_weekend: { type: Number, default: 0 },
    is_night: { type: Number, default: 0 },
    month: { type: Number, default: 1 },
    isFraud: { type: Boolean, default: false },
    fraudProbability: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
    riskTier: { type: String, default: 'Low' },
    recommendations: [{ type: String }]
}, { timestamps: true });

transactionSchema.index({ userId: 1 });
transactionSchema.index({ isFraud: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);