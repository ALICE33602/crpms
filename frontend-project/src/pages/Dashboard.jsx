import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, color, to }) => (
    <Link to={to} className={`block bg-green-50 rounded-xl shadow p-6 border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '…'}</p>
    </Link>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cars, services, records, payments] = await Promise.all([
                    api.get('/cars?limit=1'),
                    api.get('/services?limit=1'),
                    api.get('/service-records?limit=1'),
                    api.get('/payments?limit=1'),
                ]);
                setStats({
                    cars: cars.data.totalItems,
                    services: services.data.totalItems,
                    records: records.data.totalItems,
                    payments: payments.data.totalItems,
                });
            } catch { }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.username} 👋</h1>
                <p className="text-gray-500 text-sm mt-1">SmartPark Car Repair Management System — Overview</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Cars" value={stats.cars} color="border-green-500" to="/cars" />
                <StatCard label="Total Services" value={stats.services} color="border-green-600" to="/services" />
                <StatCard label="Service Records" value={stats.records} color="border-green-400" to="/service-records" />
                <StatCard label="Payments" value={stats.payments} color="border-green-700" to="/payments" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-green-50 rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { to: '/cars', label: '+ Add Car' },
                            { to: '/services', label: '+ Add Service' },
                            { to: '/service-records', label: '+ Service Record' },
                            { to: '/payments', label: '+ Payment' },
                        ].map((a) => (
                            <Link key={a.to} to={a.to} className="bg-green-800 text-white text-sm font-medium px-4 py-3 rounded-lg text-center hover:bg-green-700 transition-colors">
                                {a.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-green-50 rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Reports</h2>
                    <div className="flex flex-col gap-3">
                        <Link to="/reports?tab=bill" className="bg-green-900 text-white text-sm font-medium px-4 py-3 rounded-lg text-center hover:bg-green-800 transition-colors">
                            📄 Service Bill Report
                        </Link>
                        <Link to="/reports?tab=daily" className="bg-green-900 text-white text-sm font-medium px-4 py-3 rounded-lg text-center hover:bg-green-800 transition-colors">
                            📊 Daily Payment Report
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
