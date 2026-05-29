const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, forgotPassword, resetWithCode } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-with-code', resetWithCode);

module.exports = router;
