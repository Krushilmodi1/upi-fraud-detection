const Complaint = require("../models/complaint");

const submitComplaint = async (req, res) => {
    try {
        const { subject, category, description, transactionId, amount } = req.body;

        // Auto-priority logic
        let priority = "low";
        let autoStatus = "pending";
        const desc = (description || "").toLowerCase();
        const subj = (subject || "").toLowerCase();

        const criticalKeywords = [
            "scam",
            "hacked",
            "stolen",
            "fraud",
            "lost money",
            "cheated",
            "blocked",
            "unauthorized",
        ];
        const isCritical = criticalKeywords.some(
            (k) => desc.includes(k) || subj.includes(k),
        );

        if (amount > 50000 || isCritical || category === "fraud") {
            priority = "high";
            autoStatus = "reviewing"; // auto move to reviewing for critical
        } else if (amount > 5000 || category === "dispute") {
            priority = "medium";
        }

        const complaint = await Complaint.create({
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            subject,
            category,
            description,
            transactionId: transactionId || "",
            amount: amount || 0,
            priority,
            status: autoStatus,
        });

        // Auto-reply for low priority / non-critical
        if (priority === "low" && category !== "fraud") {

            const text = `${subject} ${description}`.toLowerCase();

            let aiReply = `Hello ${req.user.name},

Thank you for contacting FraudGuard.

After reviewing your complaint, here is our assessment:

`;

            let matched = false;

            // Money Deducted
            if (
                text.includes("money deducted") ||
                text.includes("amount deducted") ||
                text.includes("debited") ||
                text.includes("payment deducted")
            ) {
                matched = true;

                aiReply += `
💳 Money Deducted Issue Detected

Recommended Actions:
• Wait 24-48 hours for auto reversal
• Check transaction status
• Keep your UTR number safe
• Contact your bank if not refunded

`;
            }

            // UPI Problems
            if (
                text.includes("upi") ||
                text.includes("upi id") ||
                text.includes("payment failed")
            ) {
                matched = true;

                aiReply += `
📱 UPI Related Issue Detected

Recommended Actions:
• Verify UPI ID carefully
• Update your banking app
• Check bank server availability
• Retry after some time

`;
            }

            // Wrong Transfer
            if (
                text.includes("wrong transfer") ||
                text.includes("sent to wrong") ||
                text.includes("wrong account")
            ) {
                matched = true;

                aiReply += `
⚠️ Wrong Transfer Issue Detected

Recommended Actions:
• Contact your bank immediately
• Raise a dispute request
• Keep screenshots as evidence
• Save payment proof

`;
            }

            // Refund Issues
            if (
                text.includes("refund") ||
                text.includes("cashback") ||
                text.includes("money back")
            ) {
                matched = true;

                aiReply += `
💰 Refund Related Issue Detected

Recommended Actions:
• Check merchant refund timelines
• Contact merchant support
• Monitor bank statement

`;
            }

            // Dispute
            if (category === "dispute") {
                matched = true;

                aiReply += `
📋 Dispute Complaint Detected

Recommended Actions:
• Preserve all screenshots
• Save payment records
• Contact your bank immediately

`;
            }

            // High Amount Warning
            if (amount > 10000) {
                aiReply += `
🚨 Important Notice

The reported amount is ₹${amount}.

We recommend contacting your bank immediately and monitoring account activity closely.

`;
            }

            // Default Reply
            if (!matched) {
                aiReply += `
We have successfully recorded your complaint.

General Safety Recommendations:
• Never share OTPs
• Never share UPI PINs
• Verify receiver details before payment
• Call 1930 for urgent fraud issues

`;
            }

            aiReply += `
Complaint ID: ${complaint._id}

This response was generated automatically based on the complaint details you provided.

Regards,
FraudGuard Smart Assistant
`;

            complaint.adminReply = aiReply;
            complaint.status = "resolved";
            complaint.repliedAt = new Date();
            complaint.repliedBy = "FraudGuard Smart Assistant";

            await complaint.save();
        }

        res.status(201).json({
            success: true,
            data: complaint,
            autoResolved: priority === "low" && category !== "fraud",
            message:
                priority === "high"
                    ? "Critical complaint flagged. Admin will respond urgently."
                    : priority === "low" && category !== "fraud"
                        ? "Auto-resolved with guidance. Check your complaint for details."
                        : "Complaint submitted. Admin will review shortly.",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id }).sort({
            createdAt: -1,
        });
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
        const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
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
                status: status || "resolved",
                repliedAt: new Date(),
                repliedBy: req.user.name,
            },
            { new: true },
        );
        if (!complaint) {
            return res
                .status(404)
                .json({ success: false, error: "Complaint not found" });
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
            { new: true },
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
    updateStatus,
};
