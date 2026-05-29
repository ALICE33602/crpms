const express = require('express');
const router = express.Router();
const { createService, getServices, getServiceByCode, getNextCode, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createService);
router.get('/', protect, getServices);
router.get('/next-code', protect, getNextCode);
router.get('/:serviceCode', protect, getServiceByCode);
router.put('/:serviceCode', protect, updateService);
router.delete('/:serviceCode', protect, deleteService);

module.exports = router;
