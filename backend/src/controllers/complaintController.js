const Complaint = require('../models/complaint');

const submitComplaint = async (req, res) => {
    try {
        const { subject, category, description, transactionId, amount } = req.body;

        // Auto-priority logic
        let priority = 'low';
        let autoStatus = 'pending';
        const desc = (description || '').toLowerCase();
        const subj = (subject || '').toLowerCase();

        const criticalKeywords = ['scam', 'hacked', 'stolen', 'fraud', 'lost money', 'cheated', 'blocked', 'unauthorized'];
        const isCritical = criticalKeywords.some(k => desc.includes(k) || subj.includes(k));

        if (amount > 50000 || isCritical || category === 'fraud') {
            priority = 'high';
            autoStatus = 'reviewing'; // auto move to reviewing for critical
        } else if (amount > 5000 || category === 'dispute') {
            priority = 'medium';
        }

        const complaint = await Complaint.create({
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            subject,
            category,
            description,
            transactionId: transactionId || '',
            amount: amount || 0,
            priority,
            status: autoStatus
        });

        // Auto-reply for low priority / non-critical
        if (priority === 'low' && category !== 'fraud') {
            complaint.adminReply = `Thank you for contacting UPI FraudGuard support. Your complaint has been received and logged.\n\nFor general UPI issues:\n• If money is deducted but not received, wait 48 hours for auto-reversal\n• Contact your bank with UTR number if not resolved\n• Call NPCI helpline: 1800-120-1740\n\nFor urgent fraud issues call 1930 immediately.\n\nYour complaint ID: ${complaint._id}\nWe will follow up within 2 business days.`;
            complaint.status = 'resolved';
            complaint.repliedAt = new Date();
            complaint.repliedBy = 'FraudGuard Auto-Support';
            await complaint.save();
        }

        res.status(201).json({
            success: true,
            data: complaint,
            autoResolved: priority === 'low' && category !== 'fraud',
            message: priority === 'high'
                ? 'Critical complaint flagged. Admin will respond urgently.'
                : priority === 'low' && category !== 'fraud'
                ? 'Auto-resolved with guidance. Check your complaint for details.'
                : 'Complaint submitted. Admin will review shortly.'
        });
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