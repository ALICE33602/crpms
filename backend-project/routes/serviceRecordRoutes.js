const express = require('express');
const router = express.Router();
const { createServiceRecord, getServiceRecords, getServiceRecordById, updateServiceRecord, deleteServiceRecord, getNextRecordCode } = require('../controllers/serviceRecordController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createServiceRecord);
router.get('/', protect, getServiceRecords);
router.get('/next-code', protect, getNextRecordCode);
router.get('/:id', protect, getServiceRecordById);
router.put('/:id', protect, updateServiceRecord);
router.delete('/:id', protect, deleteServiceRecord);

module.exports = router;
