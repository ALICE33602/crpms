const ServiceRecord = require('../models/ServiceRecord');
const Service = require('../models/Service');

// Handle errors consistently
const handleError = (res, error) => {
    console.error('[ERROR]', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

// GET /api/reports/service-bill — Service Bill Report
// Fields: PlateNumber, ServiceName, ServiceDate, ServicePrice, AmountPaid, PaymentStatus, PaymentDate
exports.getServiceBill = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const matchQuery = {};
        if (req.query.plateNumber)
            matchQuery.plateNumber = { $regex: req.query.plateNumber, $options: 'i' };
        if (req.query.date) {
            const day = new Date(req.query.date);
            const nextDay = new Date(req.query.date);
            nextDay.setDate(nextDay.getDate() + 1);
            matchQuery.serviceDate = { $gte: day, $lt: nextDay };
        }

        const totalItems = await ServiceRecord.countDocuments(matchQuery);
        const records = await ServiceRecord.find(matchQuery)
            .sort({ serviceDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get service details for each record
        const serviceCodes = [...new Set(records.map(r => r.serviceCode))];
        const services = await Service.find({ serviceCode: { $in: serviceCodes } }).lean();
        const serviceMap = {};
        services.forEach(s => { serviceMap[s.serviceCode] = s; });

        const data = records.map(r => ({
            plateNumber: r.plateNumber,
            serviceName: serviceMap[r.serviceCode]?.serviceName || r.serviceCode,
            serviceDate: r.serviceDate,
            servicePrice: serviceMap[r.serviceCode]?.servicePrice || 0,
            amountPaid: r.amountPaid,
            paymentStatus: r.paymentStatus,
            paymentDate: r.paymentDate,
        }));

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

// GET /api/reports/daily-payment — Daily Payment Report
// Fields: PlateNumber, ServiceName, ServiceDate, AmountPaid
exports.getDailyPaymentReport = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const dateParam = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(dateParam);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateParam);
        endOfDay.setHours(23, 59, 59, 999);

        const matchQuery = { serviceDate: { $gte: startOfDay, $lte: endOfDay } };

        const totalItems = await ServiceRecord.countDocuments(matchQuery);
        const records = await ServiceRecord.find(matchQuery)
            .sort({ serviceDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const serviceCodes = [...new Set(records.map(r => r.serviceCode))];
        const services = await Service.find({ serviceCode: { $in: serviceCodes } }).lean();
        const serviceMap = {};
        services.forEach(s => { serviceMap[s.serviceCode] = s; });

        const data = records.map(r => ({
            plateNumber: r.plateNumber,
            serviceName: serviceMap[r.serviceCode]?.serviceName || r.serviceCode,
            serviceDate: r.serviceDate,
            amountPaid: r.amountPaid,
        }));

        const totalAmountPaid = data.reduce((sum, r) => sum + r.amountPaid, 0);

        return res.status(200).json({
            success: true,
            data,
            page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            totalAmountPaid,
        });
    } catch (error) {
        return handleError(res, error);
    }
};
