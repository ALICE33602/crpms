const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');

// Handle errors consistently
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
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

// POST /api/service-records — Create a new service record
exports.createServiceRecord = async (req, res) => {
    try {
        const { plateNumber, serviceCode, serviceDate, amountPaid, paymentDate } = req.body;

        if (!plateNumber || !serviceCode || !serviceDate || amountPaid === undefined)
            return res.status(400).json({ success: false, message: 'Plate number, service code, service date, and amount paid are required' });

        // Check car exists
        const car = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
        if (!car)
            return res.status(404).json({ success: false, message: 'Car with this plate number not found' });

        // Check service exists and get price
        const service = await Service.findOne({ serviceCode: serviceCode.toUpperCase() });
        if (!service)
            return res.status(404).json({ success: false, message: 'Service with this code not found' });

        // Auto-generate record code
        const last = await ServiceRecord.findOne({ recordCode: { $exists: true } }).sort({ createdAt: -1 });
        const num = last ? parseInt(last.recordCode.replace(/\D/g, '')) + 1 : 1;
        const recordCode = `RCD${String(num).padStart(3, '0')}`;

        // Compute payment status based on amount paid vs service price
        let computedStatus = 'Pending';
        if (amountPaid >= service.servicePrice) computedStatus = 'Paid';
        else if (amountPaid > 0) computedStatus = 'Partial';

        const record = await ServiceRecord.create({
            recordCode,
            plateNumber: plateNumber.toUpperCase(),
            serviceCode: serviceCode.toUpperCase(),
            serviceDate,
            amountPaid,
            paymentDate: paymentDate || (computedStatus === 'Paid' ? new Date() : undefined),
            paymentStatus: computedStatus,
        });

        return res.status(201).json({ success: true, message: 'Service record created successfully', data: record });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/service-records/next-code
exports.getNextRecordCode = async (req, res) => {
    try {
        const last = await ServiceRecord.findOne({ recordCode: { $exists: true } }).sort({ createdAt: -1 });
        const num = last ? parseInt(last.recordCode.replace(/\D/g, '')) + 1 : 1;
        const nextCode = `RCD${String(num).padStart(3, '0')}`;
        return res.status(200).json({ success: true, nextCode });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/service-records — Get all records with pagination and search
exports.getServiceRecords = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = search ? {
            $or: [
                { recordCode: { $regex: search, $options: 'i' } },
                { plateNumber: { $regex: search, $options: 'i' } },
                { serviceCode: { $regex: search, $options: 'i' } },
                { paymentStatus: { $regex: search, $options: 'i' } },
            ],
        } : {};

        const totalItems = await ServiceRecord.countDocuments(query);
        const data = await ServiceRecord.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        return res.status(200).json({
            success: true,
            data,
            page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/service-records/:id — Get one record by ID
exports.getServiceRecordById = async (req, res) => {
    try {
        const record = await ServiceRecord.findById(req.params.id);
        if (!record)
            return res.status(404).json({ success: false, message: 'Service record not found' });
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        return handleError(res, error);
    }
};

// PUT /api/service-records/:id — Update a service record
exports.updateServiceRecord = async (req, res) => {
    try {
        const { plateNumber, serviceCode, serviceDate, amountPaid, paymentDate, paymentStatus } = req.body;

        if (plateNumber) {
            const car = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
            if (!car)
                return res.status(404).json({ success: false, message: 'Car with this plate number not found' });
        }

        // Get current record to determine price if needed
        const existing = await ServiceRecord.findById(req.params.id);
        if (!existing)
            return res.status(404).json({ success: false, message: 'Service record not found' });

        const targetServiceCode = (serviceCode || existing.serviceCode).toUpperCase();

        if (serviceCode) {
            const service = await Service.findOne({ serviceCode: targetServiceCode });
            if (!service)
                return res.status(404).json({ success: false, message: 'Service with this code not found' });
        }

        const updateData = {};
        if (plateNumber) updateData.plateNumber = plateNumber.toUpperCase();
        if (serviceCode) updateData.serviceCode = targetServiceCode;
        if (serviceDate) updateData.serviceDate = serviceDate;
        if (paymentDate) updateData.paymentDate = paymentDate;

        const finalAmountPaid = amountPaid !== undefined ? amountPaid : existing.amountPaid;
        if (amountPaid !== undefined) updateData.amountPaid = finalAmountPaid;

        // Recompute payment status if amountPaid or serviceCode changed
        if (amountPaid !== undefined || serviceCode) {
            const service = await Service.findOne({ serviceCode: targetServiceCode });
            if (service) {
                if (finalAmountPaid >= service.servicePrice) updateData.paymentStatus = 'Paid';
                else if (finalAmountPaid > 0) updateData.paymentStatus = 'Partial';
                else updateData.paymentStatus = 'Pending';
            }
        } else if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        const record = await ServiceRecord.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        return res.status(200).json({ success: true, message: 'Service record updated successfully', data: record });
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE /api/service-records/:id — Delete a service record
exports.deleteServiceRecord = async (req, res) => {
    try {
        const record = await ServiceRecord.findByIdAndDelete(req.params.id);
        if (!record)
            return res.status(404).json({ success: false, message: 'Service record not found' });
        return res.status(200).json({ success: true, message: 'Service record deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
};
