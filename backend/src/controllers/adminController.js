const User = require('../models/user');
const Transaction = require('../models/transaction');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.isFraud !== undefined) {
            filter.isFraud = req.query.isFraud === 'true';
        }
        const transactions = await Transaction.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit);
        const total = await Transaction.countDocuments(filter);
        res.json({ success: true, total, page, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getModelStats = async (req, res) => {
    res.json({
        success: true,
        data: {
            model: 'XGBoost',
            accuracy: 97.04,
            precision: 95.42,
            recall: 87.02,
            f1Score: 91.02,
            rocAuc: 0.9591
        }
    });
};

module.exports = { getAllUsers, getAllTransactions, deleteUser, getModelStats };