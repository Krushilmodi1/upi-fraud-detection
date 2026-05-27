const express = require('express');
const router = express.Router();
const { analyzeTransaction, getMyTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeTransaction);
router.get('/my', protect, getMyTransactions);

module.exports = router;