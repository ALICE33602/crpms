const Payment = require('../models/Payment');
const ServiceRecord = require('../models/ServiceRecord');

const handleError = (res, error) => {
    console.error('[ERROR]', error.message);
    if (error.name === 'CastError')
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

exports.createPayment = async (req, res) => {
    try {
        const { recordId, paymentDate, receivedBy } = req.body;
        if (!recordId || !paymentDate || !receivedBy)
            return res.status(400).json({ success: false, message: 'Record ID, payment date and received by are required' });
        const record = await ServiceRecord.findById(recordId);
        if (!record)
            return res.status(404).json({ success: false, message: 'Service record not found' });
        const payment = await Payment.create({ recordId, paymentDate, receivedBy });
        return res.status(201).json({ success: true, message: 'Payment recorded successfully', data: payment });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.getPayments = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const query = search ? { receivedBy: { $regex: search, $options: 'i' } } : {};
        const totalItems = await Payment.countDocuments(query);
        const data = await Payment.find(query)
            .populate('recordId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return res.status(200).json({ success: true, data, page, totalPages: Math.ceil(totalItems / limit), totalItems });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { paymentDate, receivedBy } = req.body;
        const updateData = {};
        if (paymentDate) updateData.paymentDate = paymentDate;
        if (receivedBy) updateData.receivedBy = receivedBy;
        const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('recordId');
        if (!payment)
            return res.status(404).json({ success: false, message: 'Payment not found' });
        return res.status(200).json({ success: true, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment)
            return res.status(404).json({ success: false, message: 'Payment not found' });
        return res.status(200).json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
};
