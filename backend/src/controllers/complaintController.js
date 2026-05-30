const Complaint = require('../models/complaint');

const submitComplaint = async (req, res) => {
    try {
        const { subject, category, description, transactionId, amount } = req.body;
        const complaint = await Complaint.create({
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            subject,
            category,
            description,
            transactionId: transactionId || '',
            amount: amount || 0,
            priority: amount > 10000 ? 'high' : amount > 1000 ? 'medium' : 'low'
        });
        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const replyComplaint = async (req, res) => {
    try {
        const { reply, status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                adminReply: reply,
                status: status || 'resolved',
                repliedAt: new Date(),
                repliedBy: req.user.name
            },
            { new: true }
        );
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    submitComplaint,
    getMyComplaints,
    getAllComplaints,
    replyComplaint,
    updateStatus
};