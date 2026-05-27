const express = require('express');
const router = express.Router();
const { getAllUsers, getAllTransactions,
        deleteUser, getModelStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/users', protect, adminOnly, getAllUsers);
router.get('/transactions', protect, adminOnly, getAllTransactions);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/model-stats', protect, adminOnly, getModelStats);

module.exports = router;