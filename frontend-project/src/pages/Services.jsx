import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { serviceName: '', servicePrice: '', serviceDescription: '' };

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editService, setEditService] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [nextCode, setNextCode] = useState('');

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/services', { params: { page, limit: 10, search } });
            setServices(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        } catch {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const validate = () => {
        const e = {};
        if (!form.serviceName) e.serviceName = 'Required';
        if (!form.servicePrice) e.servicePrice = 'Required';
        else if (isNaN(form.servicePrice) || Number(form.servicePrice) <= 0) e.servicePrice = 'Must be a positive number';
        return e;
    };

    const openAdd = async () => {
        setEditService(null); setForm(EMPTY); setErrors({}); setShowModal(true);
        try {
            const { data } = await api.get('/services/next-code');
            setNextCode(data.nextCode);
        } catch { setNextCode('...'); }
    };
    const openEdit = (s) => {
        setEditService(s);
        setForm({ serviceName: s.serviceName, servicePrice: s.servicePrice, serviceDescription: s.serviceDescription || '' });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            if (editService) {
                await api.put(`/services/${editService.serviceCode}`, { ...form, servicePrice: Number(form.servicePrice) });
                toast.success('Service updated successfully');
            } else {
                await api.post('/services', { ...form, servicePrice: Number(form.servicePrice) });
                toast.success('Service added successfully');
            }
            setShowModal(false);
            setForm(EMPTY);
            setErrors({});
            setPage(1);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/services/${deleteTarget.serviceCode}`);
            toast.success('Service deleted successfully');
            setDeleteTarget(null);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete service');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Services</h1>
                    <p className="text-gray-500 text-sm">{totalItems} service{totalItems !== 1 ? 's' : ''} available</p>
                </div>
                <button onClick={openAdd}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Service
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by code or name..."
                    className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-green-800 text-white">
                        <tr>
                            {['Code', 'Service Name', 'Price (RWF)', 'Description', 'Added', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
                        ) : services.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">No services found</td></tr>
                        ) : services.map((s) => (
                            <tr key={s._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-green-800">{s.serviceCode}</td>
                                <td className="px-4 py-3">{s.serviceName}</td>
                                <td className="px-4 py-3">{Number(s.servicePrice).toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-500">{s.serviceDescription || '-'}</td>
                                <td className="px-4 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(s)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        <button onClick={() => setDeleteTarget(s)}
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">{editService ? 'Edit Service' : 'Add New Service'}</h2>
                            <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-mono">
                            Service Code: <strong>{editService ? editService.serviceCode : nextCode || '...'}</strong>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { name: 'serviceName', label: 'Service Name', placeholder: 'e.g. Oil Change' },
                                { name: 'servicePrice', label: 'Price (RWF)', placeholder: 'e.g. 5000', type: 'number' },
                            ].map(({ name, label, placeholder, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <input
                                        type={type || 'text'}
                                        value={form[name]}
                                        onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
                                        placeholder={placeholder}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                <textarea
                                    value={form.serviceDescription}
                                    onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
                                    placeholder="Brief description of the service"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                                    {saving ? 'Saving...' : editService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Service</h2>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <strong>{deleteTarget.serviceName}</strong>? This cannot be undone.</p>
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
