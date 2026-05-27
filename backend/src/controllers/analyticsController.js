const Transaction = require('../models/transaction');

const getDashboard = async (req, res) => {
    try {
        const total = await Transaction.countDocuments();
        const fraudCount = await Transaction.countDocuments({ isFraud: true });
        const safeCount = total - fraudCount;
        const fraudPercent = total > 0 ? ((fraudCount / total) * 100).toFixed(2) : 0;

        const fraudAmountData = await Transaction.aggregate([
            { $match: { isFraud: true } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);
        const totalFraudAmount = fraudAmountData[0]?.totalAmount || 0;

        const byType = await Transaction.aggregate([
            { $group: { _id: '$transaction_type', count: { $sum: 1 },
                fraudCount: { $sum: { $cond: ['$isFraud', 1, 0] } } } },
            { $sort: { _id: 1 } }
        ]);

        const byRiskTier = await Transaction.aggregate([
            { $group: { _id: '$riskTier', count: { $sum: 1 } } }
        ]);

        const trend = await Transaction.aggregate([
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                total: { $sum: 1 },
                fraud: { $sum: { $cond: ['$isFraud', 1, 0] } }
            }},
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        const highRisk = await Transaction.find({ riskTier: 'High' })
            .sort({ createdAt: -1 }).limit(10);

        res.json({
            success: true,
            data: {
                summary: { total, fraudCount, safeCount, fraudPercent, totalFraudAmount },
                byType,
                byRiskTier,
                trend,
                highRisk
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getDashboard };