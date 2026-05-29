const mongoose = require('mongoose');

/**
 * Payment model — records payment transactions for a ServiceRecord.
 * FK: recordId → ServiceRecord
 */
const paymentSchema = new mongoose.Schema(
    {
        recordId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Record ID is required'],
            ref: 'ServiceRecord',
        },
        paymentDate: {
            type: Date,
            required: [true, 'Payment date is required'],
        },
        receivedBy: {
            type: String,
            required: [true, 'Received by is required'],
            trim: true,
            maxlength: [100, 'ReceivedBy must not exceed 100 characters'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
