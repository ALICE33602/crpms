import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { recordId: '', paymentDate: '', receivedBy: '' };

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editPayment, setEditPayment] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [recordsList, setRecordsList] = useState([]);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            const { data } = await api.get('/payments', { params });
            setPayments(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        } catch {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const openAdd = async () => {
        setEditPayment(null);
        setForm(EMPTY);
        setErrors({});
        try {
            const { data } = await api.get('/service-records', { params: { limit: 1000 } });
            setRecordsList(data.data || []);
        } catch {
            toast.error('Failed to load records');
        }
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditPayment(p);
        setErrors({});
        setForm({
            recordId: p.recordId?._id || '',
            paymentDate: p.paymentDate ? p.paymentDate.slice(0, 10) : '',
            receivedBy: p.receivedBy || '',
        });
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.recordId) e.recordId = 'Required';
        if (!form.paymentDate) e.paymentDate = 'Required';
        if (!form.receivedBy) e.receivedBy = 'Required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            if (editPayment) {
                await api.put(`/payments/${editPayment._id}`, form);
                toast.success('Payment updated successfully');
            } else {
                await api.post('/payments', form);
                toast.success('Payment recorded successfully');
            }
            setShowModal(false);
            setForm(EMPTY);
            setErrors({});
            setPage(1);
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save payment');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (name, value) => {
        setForm(f => ({ ...f, [name]: value }));
        setErrors(er => ({ ...er, [name]: '' }));
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/payments/${deleteTarget._id}`);
            toast.success('Payment deleted successfully');
            setDeleteTarget(null);
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete payment');
        } finally {
            setDeleting(false);
        }
    };

    const getSelectedRecordLabel = () => {
        if (!form.recordId) return '';
        const r = recordsList.find(r => r._id === form.recordId);
        return r ? `${r.recordCode || r._id.slice(-6)} — ${r.plateNumber} (${r.serviceCode})` : form.recordId.slice(-6);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                    <p className="text-gray-500 text-sm">{totalItems} payment{totalItems !== 1 ? 's' : ''} recorded</p>
                </div>
                <button onClick={openAdd}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Payment
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by plate, service, received by..."
                    className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-green-800 text-white">
                        <tr>
                            {['Plate Number', 'Service Code', 'Amount Paid', 'Payment Date', 'Received By', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">No payments found</td></tr>
                        ) : payments.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-green-800">{p.recordId?.plateNumber || '-'}</td>
                                <td className="px-4 py-3">{p.recordId?.serviceCode || '-'}</td>
                                <td className="px-4 py-3">{p.recordId?.amountPaid != null ? Number(p.recordId.amountPaid).toLocaleString() + ' RWF' : '-'}</td>
                                <td className="px-4 py-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{p.receivedBy}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.recordId?.paymentStatus === 'Paid'
                                            ? 'bg-green-100 text-green-700'
                                            : p.recordId?.paymentStatus === 'Partial'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {p.recordId?.paymentStatus || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(p)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        <button onClick={() => setDeleteTarget(p)}
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
                            <h2 className="text-lg font-bold text-gray-800">{editPayment ? 'Edit Payment' : 'Record Payment'}</h2>
                            <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Record</label>
                                {editPayment ? (
                                    <input
                                        type="text"
                                        value={getSelectedRecordLabel()}
                                        disabled
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500"
                                    />
                                ) : (
                                    <select
                                        value={form.recordId}
                                        onChange={(e) => handleChange('recordId', e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.recordId ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">-- Select Record --</option>
                                        {recordsList.map(r => (
                                            <option key={r._id} value={r._id}>
                                                {r.recordCode || r._id.slice(-6)} — {r.plateNumber} ({r.serviceCode})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.recordId && <p className="text-red-500 text-xs mt-1">{errors.recordId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={form.paymentDate}
                                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                                <input
                                    type="text"
                                    value={form.receivedBy}
                                    onChange={(e) => handleChange('receivedBy', e.target.value)}
                                    placeholder="Staff name"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.receivedBy ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.receivedBy && <p className="text-red-500 text-xs mt-1">{errors.receivedBy}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
                                    {saving ? 'Saving...' : editPayment ? 'Update Payment' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Payment</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete this payment for <strong>{deleteTarget.recordId?.plateNumber || '-'}</strong>? This cannot be undone.
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