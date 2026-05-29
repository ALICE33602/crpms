const Service = require('../models/Service');

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

exports.createService = async (req, res) => {
    try {
        const { serviceName, servicePrice, serviceDescription } = req.body;
        if (!serviceName || !servicePrice)
            return res.status(400).json({ success: false, message: 'Service name and price are required' });

        const last = await Service.findOne().sort({ createdAt: -1 });
        const num = last ? parseInt(last.serviceCode.replace(/\D/g, '')) + 1 : 1;
        const serviceCode = `SRV${String(num).padStart(3, '0')}`;

        const service = await Service.create({ serviceCode, serviceName, servicePrice, serviceDescription });
        return res.status(201).json({ success: true, message: 'Service added successfully', data: service });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.getServices = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const query = search ? {
            $or: [
                { serviceCode: { $regex: search, $options: 'i' } },
                { serviceName: { $regex: search, $options: 'i' } },
            ],
        } : {};
        const totalItems = await Service.countDocuments(query);
        const data = await Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json({ success: true, data, page, totalPages: Math.ceil(totalItems / limit), totalItems });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.getServiceByCode = async (req, res) => {
    try {
        const service = await Service.findOne({ serviceCode: req.params.serviceCode.toUpperCase() });
        if (!service)
            return res.status(404).json({ success: false, message: 'Service not found' });
        return res.status(200).json({ success: true, data: service });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.updateService = async (req, res) => {
    try {
        const { serviceName, servicePrice, serviceDescription } = req.body;
        const updateData = {};
        if (serviceName) updateData.serviceName = serviceName;
        if (servicePrice !== undefined) updateData.servicePrice = servicePrice;
        if (serviceDescription !== undefined) updateData.serviceDescription = serviceDescription;
        const service = await Service.findOneAndUpdate(
            { serviceCode: req.params.serviceCode.toUpperCase() },
            updateData,
            { new: true, runValidators: true }
        );
        if (!service)
            return res.status(404).json({ success: false, message: 'Service not found' });
        return res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/services/next-code
exports.getNextCode = async (req, res) => {
    try {
        const last = await Service.findOne().sort({ createdAt: -1 });
        const num = last ? parseInt(last.serviceCode.replace(/\D/g, '')) + 1 : 1;
        const nextCode = `SRV${String(num).padStart(3, '0')}`;
        return res.status(200).json({ success: true, nextCode });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({ serviceCode: req.params.serviceCode.toUpperCase() });
        if (!service)
            return res.status(404).json({ success: false, message: 'Service not found' });
        return res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
};
