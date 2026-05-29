const express = require('express');
const router = express.Router();
const { getServiceBill, getDailyPaymentReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/service-bill', protect, getServiceBill);
router.get('/daily-payment', protect, getDailyPaymentReport);

module.exports = router;
