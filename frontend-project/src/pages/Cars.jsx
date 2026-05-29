import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { plateNumber: '', type: '', model: '', manufacturingYear: '', driverPhone: '', mechanicName: '' };

const CAR_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Minibus', 'Bus', 'Pickup', 'Coupe', 'Hatchback', 'Convertible', 'Wagon', 'Motorcycle'];

const CAR_MODELS_BY_TYPE = {
    Sedan: ['Toyota Corolla', 'Toyota Camry', 'Honda Civic', 'Honda Accord', 'Nissan Sentra', 'Mazda 3', 'Hyundai Elantra', 'Kia Cerato', 'BMW 3 Series', 'Mercedes C-Class', 'Other'],
    SUV: ['Toyota RAV4', 'Toyota Land Cruiser', 'Toyota Fortuner', 'Honda CR-V', 'Nissan X-Trail', 'Nissan Patrol', 'Mitsubishi Pajero', 'Ford Explorer', 'Hyundai Tucson', 'Kia Sportage', 'BMW X5', 'Land Rover Discovery', 'Other'],
    Truck: ['Toyota Hilux', 'Nissan Navara', 'Ford Ranger', 'Mitsubishi L200', 'Isuzu D-Max', 'Mercedes Actros', 'Other'],
    Van: ['Toyota HiAce', 'Nissan Urvan', 'Mercedes Sprinter', 'Ford Transit', 'Volkswagen Transporter', 'Other'],
    Minibus: ['Toyota Coaster', 'Nissan Civilian', 'Isuzu NQR', 'Other'],
    Bus: ['Yutong', 'King Long', 'Scania', 'Mercedes-Benz Bus', 'Other'],
    Pickup: ['Toyota Hilux', 'Ford Ranger', 'Nissan Navara', 'Isuzu D-Max', 'Mitsubishi L200', 'Other'],
    Coupe: ['BMW 4 Series', 'Mercedes C-Class Coupe', 'Audi A5', 'Honda Civic Coupe', 'Other'],
    Hatchback: ['Toyota Yaris', 'Honda Fit', 'Volkswagen Golf', 'Mazda 2', 'Hyundai i20', 'Other'],
    Convertible: ['Mazda MX-5', 'BMW Z4', 'Mercedes SLK', 'Audi A3 Cabriolet', 'Other'],
    Wagon: ['Toyota Fielder', 'Subaru Outback', 'Volkswagen Passat', 'Volvo V60', 'Other'],
    Motorcycle: ['Honda CB', 'Yamaha', 'Suzuki', 'TVS', 'Bajaj', 'Other'],
};

export default function Cars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const debounceRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editCar, setEditCar] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCars = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/cars', { params: { page, limit: 10, search } });
            setCars(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        } catch {
            toast.error('Failed to load cars');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchCars(); }, [fetchCars]);

    const handleChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'type') updated.model = '';
            return updated;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!editCar) {
            if (!form.plateNumber) {
                e.plateNumber = 'Required';
            } else if (!/^[A-Z]{3}\s?\d{3}[A-Z]$/i.test(form.plateNumber) && !/^[A-Z0-9\- ]{2,15}$/i.test(form.plateNumber)) {
                e.plateNumber = 'Use Rwandan (e.g. RAB 123A) or international plate';
            }
        }
        if (!form.type) e.type = 'Required';
        if (!form.model) e.model = 'Required';
        if (!form.manufacturingYear) e.manufacturingYear = 'Required';
        else if (form.manufacturingYear < 1900 || form.manufacturingYear > new Date().getFullYear()) e.manufacturingYear = 'Invalid year';
        if (!form.driverPhone) {
            e.driverPhone = 'Required';
        } else if (!/^07\d{8}$/.test(form.driverPhone)) {
            e.driverPhone = 'Phone must be exactly 10 digits starting with 07 (e.g. 0788123456)';
        }
        if (!form.mechanicName) e.mechanicName = 'Required';
        return e;
    };

    const openAdd = () => { setEditCar(null); setForm(EMPTY); setErrors({}); setShowModal(true); };
    const openEdit = (car) => {
        setEditCar(car);
        setForm({ plateNumber: car.plateNumber, type: car.type, model: car.model, manufacturingYear: car.manufacturingYear, driverPhone: car.driverPhone, mechanicName: car.mechanicName });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            if (editCar) {
                await api.put(`/cars/${editCar.plateNumber}`, form);
                toast.success('Car updated successfully');
            } else {
                await api.post('/cars', form);
                toast.success('Car added successfully');
            }
            setShowModal(false);
            setForm(EMPTY);
            setErrors({});
            setPage(1);
            fetchCars();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save car');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/cars/${deleteTarget.plateNumber}`);
            toast.success('Car deleted successfully');
            setDeleteTarget(null);
            fetchCars();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete car');
        } finally {
            setDeleting(false);
        }
    };

    const inputClass = (field) =>
        `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors ${errors[field] ? 'border-red-500' : 'border-gray-300'}`;

    const models = CAR_MODELS_BY_TYPE[form.type] || [];
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cars</h1>
                    <p className="text-gray-500 text-sm">{totalItems} car{totalItems !== 1 ? 's' : ''} registered</p>
                </div>
                <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    + Add Car
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(() => { setSearch(e.target.value); setPage(1); }, 500);
                    }}
                    placeholder="Search by plate, type, model, mechanic..."
                    className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-green-800 text-white">
                        <tr>
                            {['Plate Number', 'Type', 'Model', 'Year', 'Driver Phone', 'Mechanic', 'Registered', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
                        ) : cars.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">No cars found</td></tr>
                        ) : cars.map((car) => (
                            <tr key={car._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-green-800">{car.plateNumber}</td>
                                <td className="px-4 py-3">{car.type}</td>
                                <td className="px-4 py-3">{car.model}</td>
                                <td className="px-4 py-3">{car.manufacturingYear}</td>
                                <td className="px-4 py-3">{car.driverPhone}</td>
                                <td className="px-4 py-3">{car.mechanicName}</td>
                                <td className="px-4 py-3 text-gray-400">{new Date(car.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(car)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        <button onClick={() => setDeleteTarget(car)}
                                            className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Next</button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">{editCar ? 'Edit Car' : 'Add New Car'}</h2>
                            <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { name: 'plateNumber', label: 'Plate Number', placeholder: 'e.g. RAB 123A' },
                                { name: 'driverPhone', label: 'Driver Phone', placeholder: 'e.g. 0788123456' },
                                { name: 'mechanicName', label: 'Mechanic Name', placeholder: 'e.g. John Doe' },
                            ].map(({ name, label, placeholder }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <input
                                        type="text"
                                        value={form[name] || ''}
                                        onChange={(e) => handleChange(name, e.target.value)}
                                        placeholder={placeholder}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Select type</option>
                                    {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                <select value={form.model} onChange={(e) => handleChange('model', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.model ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">Select model</option>
                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year</label>
                                <input type="number" value={form.manufacturingYear} onChange={(e) => handleChange('manufacturingYear', e.target.value)} placeholder="e.g. 2020"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.manufacturingYear ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.manufacturingYear && <p className="text-red-500 text-xs mt-1">{errors.manufacturingYear}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                                    {saving ? 'Saving...' : editCar ? 'Update Car' : 'Add Car'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Car</h2>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <strong>{deleteTarget.plateNumber}</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
