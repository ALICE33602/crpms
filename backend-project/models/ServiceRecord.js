const mongoose = require('mongoose');

/**
 * ServiceRecord model — links a Car to a Service with payment info.
 * FK: plateNumber → Car, serviceCode → Service
 * Supports full CRUD (Insert, Update, Delete, Retrieve).
 */
const serviceRecordSchema = new mongoose.Schema(
    {
        recordCode: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true,
        },
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            trim: true,
            uppercase: true,
            ref: 'Car',
        },
        serviceCode: {
            type: String,
            required: [true, 'Service code is required'],
            trim: true,
            uppercase: true,
            ref: 'Service',
        },
        serviceDate: {
            type: Date,
            required: [true, 'Service date is required'],
        },
        amountPaid: {
            type: Number,
            required: [true, 'Amount paid is required'],
            min: [0, 'Amount paid must be a positive number'],
        },
        paymentDate: {
            type: Date,
        },
        paymentStatus: {
            type: String,
            enum: {
                values: ['Paid', 'Pending', 'Partial'],
                message: 'Payment status must be Paid, Pending, or Partial',
            },
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
