require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Car = require('./models/Car');
const Service = require('./models/Service');
const ServiceRecord = require('./models/ServiceRecord');
const Payment = require('./models/Payment');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Car.deleteMany({}),
            Service.deleteMany({}),
            ServiceRecord.deleteMany({}),
            Payment.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // ── Users ──────────────────────────────────────────────
        await User.create([
            { username: 'admin', password: 'Admin@1234', email: 'admin@crpms.com', role: 'admin' },
            { username: 'manager', password: 'Manager@1234', email: 'manager@crpms.com', role: 'manager' },
        ]);
        console.log('👤 Users seeded  →  admin / Admin@1234   |   manager / Manager@1234');

        // ── Cars ───────────────────────────────────────────────
        const cars = await Car.create([
            { plateNumber: 'RAB 123A', type: 'Sedan', model: 'Toyota Corolla', manufacturingYear: 2018, driverPhone: '0781234567', mechanicName: 'Jean Pierre Habimana' },
            { plateNumber: 'RAC 456B', type: 'SUV', model: 'Toyota RAV4', manufacturingYear: 2020, driverPhone: '0782345678', mechanicName: 'Eric Nshimiyimana' },
            { plateNumber: 'RAD 789C', type: 'Pickup', model: 'Toyota Hilux', manufacturingYear: 2019, driverPhone: '0783456789', mechanicName: 'Patrick Uwimana' },
            { plateNumber: 'RAE 321D', type: 'Sedan', model: 'Honda Civic', manufacturingYear: 2017, driverPhone: '0784567890', mechanicName: 'Jean Pierre Habimana' },
            { plateNumber: 'RAF 654E', type: 'Minibus', model: 'Toyota Hiace', manufacturingYear: 2016, driverPhone: '0785678901', mechanicName: 'Eric Nshimiyimana' },
            { plateNumber: 'RAG 987F', type: 'SUV', model: 'Nissan X-Trail', manufacturingYear: 2021, driverPhone: '0786789012', mechanicName: 'Patrick Uwimana' },
            { plateNumber: 'RAH 147G', type: 'Sedan', model: 'Mazda 3', manufacturingYear: 2019, driverPhone: '0787890123', mechanicName: 'Jean Pierre Habimana' },
            { plateNumber: 'RAI 258H', type: 'Truck', model: 'Isuzu D-Max', manufacturingYear: 2015, driverPhone: '0788901234', mechanicName: 'Eric Nshimiyimana' },
        ]);
        console.log('🚗 Cars seeded');

        // ── Services ───────────────────────────────────────────
        const services = await Service.create([
            { serviceCode: 'SRV001', serviceName: 'Oil Change', servicePrice: 15000, serviceDescription: 'Full engine oil change with filter replacement' },
            { serviceCode: 'SRV002', serviceName: 'Brake Inspection', servicePrice: 10000, serviceDescription: 'Full brake system check and pad replacement if needed' },
            { serviceCode: 'SRV003', serviceName: 'Tire Rotation', servicePrice: 8000, serviceDescription: 'Rotate all four tires for even wear' },
            { serviceCode: 'SRV004', serviceName: 'Engine Tune-Up', servicePrice: 35000, serviceDescription: 'Spark plugs, air filter, and fuel system service' },
            { serviceCode: 'SRV005', serviceName: 'Battery Replacement', servicePrice: 25000, serviceDescription: 'Replace old battery with new one' },
            { serviceCode: 'SRV006', serviceName: 'AC Service', servicePrice: 20000, serviceDescription: 'Air conditioning system check and gas refill' },
            { serviceCode: 'SRV007', serviceName: 'Wheel Alignment', servicePrice: 12000, serviceDescription: 'Four-wheel alignment and balancing' },
            { serviceCode: 'SRV008', serviceName: 'Transmission Service', servicePrice: 45000, serviceDescription: 'Transmission fluid flush and filter change' },
            { serviceCode: 'SRV009', serviceName: 'Suspension Check', servicePrice: 18000, serviceDescription: 'Full suspension and steering inspection' },
            { serviceCode: 'SRV010', serviceName: 'Full Car Service', servicePrice: 80000, serviceDescription: 'Comprehensive full-vehicle service package' },
        ]);
        console.log('🔧 Services seeded');

        // ── Service Records ────────────────────────────────────
        const records = await ServiceRecord.create([
            { plateNumber: 'RAB 123A', serviceCode: 'SRV001', serviceDate: new Date('2026-05-01'), amountPaid: 15000, paymentDate: new Date('2026-05-01'), paymentStatus: 'Paid' },
            { plateNumber: 'RAC 456B', serviceCode: 'SRV004', serviceDate: new Date('2026-05-03'), amountPaid: 20000, paymentDate: new Date('2026-05-03'), paymentStatus: 'Partial' },
            { plateNumber: 'RAD 789C', serviceCode: 'SRV002', serviceDate: new Date('2026-05-05'), amountPaid: 0, paymentDate: new Date('2026-05-05'), paymentStatus: 'Pending' },
            { plateNumber: 'RAE 321D', serviceCode: 'SRV007', serviceDate: new Date('2026-05-08'), amountPaid: 12000, paymentDate: new Date('2026-05-08'), paymentStatus: 'Paid' },
            { plateNumber: 'RAF 654E', serviceCode: 'SRV010', serviceDate: new Date('2026-05-10'), amountPaid: 50000, paymentDate: new Date('2026-05-10'), paymentStatus: 'Partial' },
            { plateNumber: 'RAG 987F', serviceCode: 'SRV006', serviceDate: new Date('2026-05-12'), amountPaid: 20000, paymentDate: new Date('2026-05-12'), paymentStatus: 'Paid' },
            { plateNumber: 'RAH 147G', serviceCode: 'SRV003', serviceDate: new Date('2026-05-15'), amountPaid: 0, paymentDate: new Date('2026-05-15'), paymentStatus: 'Pending' },
            { plateNumber: 'RAI 258H', serviceCode: 'SRV008', serviceDate: new Date('2026-05-18'), amountPaid: 45000, paymentDate: new Date('2026-05-18'), paymentStatus: 'Paid' },
            { plateNumber: 'RAB 123A', serviceCode: 'SRV005', serviceDate: new Date('2026-05-20'), amountPaid: 25000, paymentDate: new Date('2026-05-20'), paymentStatus: 'Paid' },
            { plateNumber: 'RAC 456B', serviceCode: 'SRV009', serviceDate: new Date('2026-05-22'), amountPaid: 10000, paymentDate: new Date('2026-05-22'), paymentStatus: 'Partial' },
            { plateNumber: 'RAD 789C', serviceCode: 'SRV001', serviceDate: new Date('2026-05-26'), amountPaid: 15000, paymentDate: new Date('2026-05-26'), paymentStatus: 'Paid' },
            { plateNumber: 'RAE 321D', serviceCode: 'SRV002', serviceDate: new Date('2026-05-26'), amountPaid: 0, paymentDate: new Date('2026-05-26'), paymentStatus: 'Pending' },
        ]);
        console.log('📋 Service Records seeded');

        // ── Payments (only for Paid / Partial records) ─────────
        const paidRecords = records.filter(r => r.paymentStatus !== 'Pending');
        await Payment.create(
            paidRecords.map(r => ({
                recordId: r._id,
                paymentDate: r.paymentDate,
                receivedBy: 'Jean Pierre Habimana',
            }))
        );
        console.log('💰 Payments seeded');

        console.log('\n🎉 Database seeded successfully!');
        console.log('─────────────────────────────────────');
        console.log('Login credentials:');
        console.log('  Username: admin      Password: Admin@1234');
        console.log('  Username: manager    Password: Manager@1234');
        console.log('─────────────────────────────────────');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seed();
