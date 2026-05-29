const Car = require('../models/Car');

const handleError = (res, error) => {
    console.error('[ERROR]', error.message);
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
        const msg = Object.values(error.errors).map(e => e.message).join(', ');
        return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

// POST /api/cars
exports.createCar = async (req, res) => {
    try {
        const { plateNumber, type, model, manufacturingYear, driverPhone, mechanicName } = req.body;
        if (!plateNumber || !type || !model || !manufacturingYear || !driverPhone || !mechanicName)
            return res.status(400).json({ success: false, message: 'All fields are required' });

        const existing = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
        if (existing)
            return res.status(400).json({ success: false, message: 'A car with this plate number already exists' });

        const car = await Car.create({ plateNumber, type, model, manufacturingYear, driverPhone, mechanicName });
        return res.status(201).json({ success: true, message: 'Car added successfully', data: car });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/cars
exports.getCars = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const query = search ? {
            $or: [
                { plateNumber: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { mechanicName: { $regex: search, $options: 'i' } },
            ],
        } : {};
        const totalItems = await Car.countDocuments(query);
        const data = await Car.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json({ success: true, data, page, totalPages: Math.ceil(totalItems / limit), totalItems });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/cars/:plateNumber
exports.getCarByPlate = async (req, res) => {
    try {
        const car = await Car.findOne({ plateNumber: req.params.plateNumber.toUpperCase() });
        if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
        return res.status(200).json({ success: true, data: car });
    } catch (error) {
        return handleError(res, error);
    }
};

// PUT /api/cars/:plateNumber
exports.updateCar = async (req, res) => {
    try {
        const { plateNumber, type, model, manufacturingYear, driverPhone, mechanicName } = req.body;
        const oldPlate = req.params.plateNumber.toUpperCase();

        if (plateNumber && plateNumber.toUpperCase() !== oldPlate) {
            const existing = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
            if (existing) return res.status(400).json({ success: false, message: 'A car with this plate number already exists' });
        }

        const updateData = {};
        if (plateNumber) updateData.plateNumber = plateNumber;
        if (type) updateData.type = type;
        if (model) updateData.model = model;
        if (manufacturingYear) updateData.manufacturingYear = manufacturingYear;
        if (driverPhone) updateData.driverPhone = driverPhone;
        if (mechanicName) updateData.mechanicName = mechanicName;

        const car = await Car.findOneAndUpdate(
            { plateNumber: oldPlate },
            updateData,
            { new: true, runValidators: true }
        );
        if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
        return res.status(200).json({ success: true, message: 'Car updated successfully', data: car });
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE /api/cars/:plateNumber
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findOneAndDelete({ plateNumber: req.params.plateNumber.toUpperCase() });
        if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
        return res.status(200).json({ success: true, message: 'Car deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
};
