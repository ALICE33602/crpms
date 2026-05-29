const express = require('express');
const router = express.Router();
const { createCar, getCars, getCarByPlate, updateCar, deleteCar } = require('../controllers/carController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createCar);
router.get('/', protect, getCars);
router.get('/:plateNumber', protect, getCarByPlate);
router.put('/:plateNumber', protect, updateCar);
router.delete('/:plateNumber', protect, deleteCar);

module.exports = router;
