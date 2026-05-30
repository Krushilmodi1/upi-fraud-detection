const express = require('express');
const router = express.Router();
const {
    submitComplaint,
    getMyComplaints,
    getAllComplaints,
    replyComplaint,
    updateStatus
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, adminOnly, getAllComplaints);
router.put('/:id/reply', protect, adminOnly, replyComplaint);
router.put('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;