const Transaction = require('../models/transaction');
const axios = require('axios');

const analyzeTransaction = async (req, res) => {
    try {
        const transactionData = req.body;

        // Call FastAPI ML model
        const mlResponse = await axios.post(
            `${process.env.ML_API_URL}/predict`,
            transactionData,
            { timeout: 10000 }
        );

        const mlResult = mlResponse.data;

        // Save to MongoDB
        const transaction = await Transaction.create({
            userId: req.user._id,
            ...transactionData,
            isFraud: mlResult.is_fraud,
            fraudProbability: mlResult.fraud_probability,
            riskScore: mlResult.risk_score,
            riskTier: mlResult.risk_tier,
            recommendations: mlResult.recommendations
        });

        res.status(201).json({
            success: true,
            data: {
                transaction,
                mlResult
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { analyzeTransaction, getMyTransactions };