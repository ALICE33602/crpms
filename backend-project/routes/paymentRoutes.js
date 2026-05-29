const express = require('express');
const router = express.Router();
const { createPayment, getPayments, updatePayment, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createPayment);
router.get('/', protect, getPayments);
router.put('/:id', protect, updatePayment);
router.delete('/:id', protect, deletePayment);

module.exports = router;
