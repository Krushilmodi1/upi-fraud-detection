const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboard);

module.exports = router;