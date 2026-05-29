const mongoose = require('mongoose');

/**
 * Car model — stores vehicle and assigned mechanic info.
 * PlateNumber is the primary key (unique identifier).
 */
const carSchema = new mongoose.Schema(
    {
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            validate: {
                validator: function (v) {
                    return /^[A-Z]{3}\s?\d{3}[A-Z]$/.test(v) || /^[A-Z0-9\- ]{2,15}$/.test(v);
                },
                message: 'Invalid plate number (use Rwandan format e.g. RAB 123A or international)',
            },
        },
        type: {
            type: String,
            required: [true, 'Car type is required'],
            trim: true,
            maxlength: [50, 'Car type must not exceed 50 characters'],
        },
        model: {
            type: String,
            required: [true, 'Car model is required'],
            trim: true,
            maxlength: [50, 'Car model must not exceed 50 characters'],
        },
        manufacturingYear: {
            type: Number,
            required: [true, 'Manufacturing year is required'],
            min: [1900, 'Year must be 1900 or later'],
            max: [new Date().getFullYear(), 'Year cannot be in the future'],
        },
        driverPhone: {
            type: String,
            required: [true, 'Driver phone is required'],
            trim: true,
            match: [/^07\d{8}$/, 'Phone must be exactly 10 digits starting with 07 (e.g. 0788123456)'],
        },
        mechanicName: {
            type: String,
            required: [true, 'Mechanic name is required'],
            trim: true,
            maxlength: [100, 'Mechanic name must not exceed 100 characters'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
