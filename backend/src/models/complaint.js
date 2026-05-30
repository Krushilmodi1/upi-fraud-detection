const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    category: {
        type: String,
        enum: ['fraud', 'dispute', 'upi_issue', 'account', 'other'],
        required: true
    },
    description: { type: String, required: true },
    transactionId: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date },
    repliedBy: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);