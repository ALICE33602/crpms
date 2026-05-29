import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { plateNumber: '', serviceCode: '', serviceDate: '', amountPaid: '', paymentDate: '' };

const STATUS_COLORS = {
    Paid: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Partial: 'bg-orange-100 text-orange-700',
};

export default function ServiceRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [cars, setCars] = useState([]);
    const [services, setServices] = useState([]);
    const [nextCode, setNextCode] = useState('');
    const [selectedServicePrice, setSelectedServicePrice] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/service-records', { params: { page, limit: 10, search } });
            setRecords(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        } catch {
            toast.error('Failed to load service records');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const openAdd = async () => {
        setEditRecord(null);
        setForm(EMPTY);
        setErrors({});
        setSelectedServicePrice(0);
        try {
            const [carsRes, servicesRes, codeRes] = await Promise.all([
                api.get('/cars', { params: { limit: 1000 } }),
                api.get('/services', { params: { limit: 1000 } }),
                api.get('/service-records/next-code'),
            ]);
            setCars(carsRes.data.data || []);
            setServices(servicesRes.data.data || []);
            setNextCode(codeRes.data.nextCode);
        } catch {
            toast.error('Failed to load form data');
        }
        setShowModal(true);
    };

    const openEdit = async (r) => {
        setEditRecord(r);
        setSelectedServicePrice(0);
        setErrors({});
        try {
            const [carsRes, servicesRes] = await Promise.all([
                api.get('/cars', { params: { limit: 1000 } }),
                api.get('/services', { params: { limit: 1000 } }),
            ]);
            setCars(carsRes.data.data || []);
            setServices(servicesRes.data.data || []);
            const svc = servicesRes.data.data?.find(s => s.serviceCode === r.serviceCode);
            if (svc) setSelectedServicePrice(svc.servicePrice);
        } catch {
            toast.error('Failed to load form data');
        }
        setForm({
            plateNumber: r.plateNumber || '',
            serviceCode: r.serviceCode || '',
            serviceDate: r.serviceDate ? r.serviceDate.slice(0, 10) : '',
            amountPaid: r.amountPaid ?? '',
            paymentDate: r.paymentDate ? r.paymentDate.slice(0, 10) : '',
        });
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.plateNumber) e.plateNumber = 'Please select a plate number';
        if (!form.serviceCode) e.serviceCode = 'Please select a service';
        if (!form.serviceDate) e.serviceDate = 'Required';
        if (form.amountPaid === '' || form.amountPaid === undefined) e.amountPaid = 'Required';
        else if (isNaN(form.amountPaid) || Number(form.amountPaid) < 0) e.amountPaid = 'Must be a valid amount';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            const payload = { ...form, amountPaid: Number(form.amountPaid) };
            if (editRecord) {
                await api.put(`/service-records/${editRecord._id}`, payload);
                toast.success('Service record updated successfully');
            } else {
                await api.post('/service-records', payload);
                toast.success('Service record created successfully');
            }
            setShowModal(false);
            setPage(1);
            fetchRecords();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service record');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (name, value) => {
        setForm(f => ({ ...f, [name]: value }));
        setErrors(er => ({ ...er, [name]: '' }));
        if (name === 'serviceCode') {
            const svc = services.find(s => s.serviceCode === value);
            setSelectedServicePrice(svc ? svc.servicePrice : 0);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/service-records/${deleteTarget._id}`);
            toast.success('Service record deleted successfully');
            setDeleteTarget(null);
            fetchRecords();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete service record');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Service Records</h1>
                    <p className="text-gray-500 text-sm">{totalItems} record{totalItems !== 1 ? 's' : ''} found</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Record
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by code, plate, status..."
                    className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-green-800 text-white">
                        <tr>
                            {['Record Code', 'Plate Number', 'Service Code', 'Service Date', 'Amount Paid', 'Payment Date', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">No records found</td></tr>
                        ) : records.map((r) => (
                            <tr key={r._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-green-800">{r.recordCode}</td>
                                <td className="px-4 py-3">{r.plateNumber}</td>
                                <td className="px-4 py-3">{r.serviceCode}</td>
                                <td className="px-4 py-3">{new Date(r.serviceDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{Number(r.amountPaid).toLocaleString()} RWF</td>
                                <td className="px-4 py-3">{r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                                        {r.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(r)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        <button onClick={() => setDeleteTarget(r)}
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
                            <h2 className="text-lg font-bold text-gray-800">{editRecord ? 'Edit Service Record' : 'Add Service Record'}</h2>
                            <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editRecord && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Code</label>
                                    <input
                                        type="text"
                                        value={nextCode}
                                        disabled
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                                <select
                                    value={form.plateNumber}
                                    onChange={(e) => handleChange('plateNumber', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">-- Select Plate Number --</option>
                                    {cars.map(c => (
                                        <option key={c._id} value={c.plateNumber}>{c.plateNumber}</option>
                                    ))}
                                </select>
                                {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                <select
                                    value={form.serviceCode}
                                    onChange={(e) => handleChange('serviceCode', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.serviceCode ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">-- Select Service --</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s.serviceCode}>{s.serviceCode} — {s.serviceName}</option>
                                    ))}
                                </select>
                                {errors.serviceCode && <p className="text-red-500 text-xs mt-1">{errors.serviceCode}</p>}
                                {selectedServicePrice > 0 && (
                                    <p className="text-green-700 text-xs mt-1 font-medium">Service Price: {selectedServicePrice.toLocaleString()} RWF</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
                                <input
                                    type="date"
                                    value={form.serviceDate}
                                    onChange={(e) => handleChange('serviceDate', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.serviceDate ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.serviceDate && <p className="text-red-500 text-xs mt-1">{errors.serviceDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (RWF)</label>
                                <input
                                    type="number"
                                    value={form.amountPaid}
                                    onChange={(e) => handleChange('amountPaid', e.target.value)}
                                    placeholder="e.g. 5000"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.amountPaid ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input
                                    type="date"
                                    value={form.paymentDate}
                                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                Payment status will be auto-computed based on amount paid vs service price.
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                                    {saving ? 'Saving...' : editRecord ? 'Update Record' : 'Add Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Service Record</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete record <strong>{deleteTarget.recordCode}</strong> for <strong>{deleteTarget.plateNumber}</strong>? This cannot be undone.
                        </p>
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