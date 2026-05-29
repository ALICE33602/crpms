const mongoose = require('mongoose');

/**
 * Service model — defines repair/maintenance services offered.
 * ServiceCode is the primary key.
 */
const serviceSchema = new mongoose.Schema(
    {
        serviceCode: {
            type: String,
            required: [true, 'Service code is required'],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [20, 'Service code must not exceed 20 characters'],
        },
        serviceName: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            maxlength: [100, 'Service name must not exceed 100 characters'],
        },
        servicePrice: {
            type: Number,
            required: [true, 'Service price is required'],
            min: [0, 'Service price must be a positive number'],
        },
        serviceDescription: {
            type: String,
            trim: true,
            maxlength: [500, 'Description must not exceed 500 characters'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
