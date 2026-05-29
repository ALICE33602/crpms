import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const printReport = (title, headers, rows, foot) => {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #166534; }
            p.sub { font-size: 13px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #166534; color: #fff; padding: 10px 12px; text-align: left; }
            td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #f9fafb; }
            .total { font-weight: bold; text-align: right; padding: 10px 12px; border-top: 2px solid #166534; }
            .total-val { font-weight: bold; padding: 10px 12px; border-top: 2px solid #166534; }
            @media print { body { padding: 20px; } }
        </style></head><body>
        <h1>SmartPark CRPMS</h1>
        <p class="sub">${title} — ${new Date().toLocaleDateString()}</p>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        ${foot ? `<tfoot><tr><td class="total" colspan="${headers.length - 1}">Total</td><td class="total-val">${foot}</td></tr></tfoot>` : ''}
        </table></body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
};

export default function Reports() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'bill';

    const [billData, setBillData] = useState([]);
    const [billLoading, setBillLoading] = useState(false);
    const [billPage, setBillPage] = useState(1);
    const [billTotalPages, setBillTotalPages] = useState(1);
    const [billTotalItems, setBillTotalItems] = useState(0);
    const [billPlate, setBillPlate] = useState('');
    const [billDate, setBillDate] = useState('');

    const [dailyData, setDailyData] = useState([]);
    const [dailyLoading, setDailyLoading] = useState(false);
    const [dailyPage, setDailyPage] = useState(1);
    const [dailyTotalPages, setDailyTotalPages] = useState(1);
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyTotal, setDailyTotal] = useState(0);

    const fetchBill = useCallback(async () => {
        setBillLoading(true);
        try {
            const { data } = await api.get('/reports/service-bill', {
                params: { page: billPage, limit: 10, plateNumber: billPlate, date: billDate },
            });
            setBillData(data.data);
            setBillTotalPages(data.totalPages);
            setBillTotalItems(data.totalItems);
        } catch {
            toast.error('Failed to load service bill report');
        } finally {
            setBillLoading(false);
        }
    }, [billPage, billPlate, billDate]);

    const fetchDaily = useCallback(async () => {
        setDailyLoading(true);
        try {
            const { data } = await api.get('/reports/daily-payment', {
                params: { page: dailyPage, limit: 10, date: dailyDate },
            });
            setDailyData(data.data);
            setDailyTotalPages(data.totalPages);
            setDailyTotal(data.totalAmountPaid || 0);
        } catch {
            toast.error('Failed to load daily payment report');
        } finally {
            setDailyLoading(false);
        }
    }, [dailyPage, dailyDate]);

    useEffect(() => { if (activeTab === 'bill') fetchBill(); }, [activeTab, fetchBill]);
    useEffect(() => { if (activeTab === 'daily') fetchDaily(); }, [activeTab, fetchDaily]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                <p className="text-gray-500 text-sm">View service bills and daily payment summaries</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setSearchParams({ tab: 'bill' })}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bill' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Service Bill Report
                </button>
                <button
                    onClick={() => setSearchParams({ tab: 'daily' })}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'daily' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Daily Payment Report
                </button>
            </div>

            {/* Service Bill Tab */}
            {activeTab === 'bill' && (
                <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                        <input
                            type="text"
                            value={billPlate}
                            onChange={(e) => { setBillPlate(e.target.value); setBillPage(1); }}
                            placeholder="Filter by plate number..."
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="date"
                            value={billDate}
                            onChange={(e) => { setBillDate(e.target.value); setBillPage(1); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            onClick={() => { setBillPlate(''); setBillDate(''); setBillPage(1); }}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">{billTotalItems} record{billTotalItems !== 1 ? 's' : ''} found</p>
                        <button onClick={() => printReport(
                            'Service Bill Report',
                            ['Plate Number', 'Service Name', 'Service Date', 'Price (RWF)', 'Amount Paid', 'Status', 'Payment Date'],
                            billData.map(r => [
                                r.plateNumber,
                                r.serviceName,
                                new Date(r.serviceDate).toLocaleDateString(),
                                Number(r.servicePrice).toLocaleString(),
                                Number(r.amountPaid).toLocaleString(),
                                r.paymentStatus,
                                r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '-',
                            ])
                        )}
                            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-800 text-white">
                                <tr>
                                    {['Plate Number', 'Service Name', 'Service Date', 'Price (RWF)', 'Amount Paid', 'Status', 'Payment Date'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {billLoading ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                                ) : billData.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No records found</td></tr>
                                ) : billData.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-green-800">{r.plateNumber}</td>
                                        <td className="px-4 py-3">{r.serviceName}</td>
                                        <td className="px-4 py-3">{new Date(r.serviceDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{Number(r.servicePrice).toLocaleString()}</td>
                                        <td className="px-4 py-3">{Number(r.amountPaid).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.paymentStatus === 'Paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : r.paymentStatus === 'Partial'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {r.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {billTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                            <span>Page {billPage} of {billTotalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setBillPage(p => Math.max(1, p - 1))} disabled={billPage === 1} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Prev</button>
                                <button onClick={() => setBillPage(p => Math.min(billTotalPages, p + 1))} disabled={billPage === billTotalPages} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Daily Payment Tab */}
            {activeTab === 'daily' && (
                <div>
                    <div className="flex flex-wrap gap-3 mb-4 items-center">
                        <input
                            type="date"
                            value={dailyDate}
                            onChange={(e) => { setDailyDate(e.target.value); setDailyPage(1); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-500">
                            Total collected: <span className="font-semibold text-gray-800">{Number(dailyTotal).toLocaleString()} RWF</span>
                        </span>
                        <button onClick={() => printReport(
                            'Daily Payment Report',
                            ['Plate Number', 'Service Name', 'Service Date', 'Amount Paid (RWF)'],
                            dailyData.map(r => [
                                r.plateNumber,
                                r.serviceName,
                                new Date(r.serviceDate).toLocaleDateString(),
                                Number(r.amountPaid).toLocaleString(),
                            ]),
                            Number(dailyTotal).toLocaleString() + ' RWF'
                        )}
                            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-800 text-white">
                                <tr>
                                    {['Plate Number', 'Service Name', 'Service Date', 'Amount Paid (RWF)'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dailyLoading ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>
                                ) : dailyData.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">No payments for this date</td></tr>
                                ) : dailyData.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-green-800">{r.plateNumber}</td>
                                        <td className="px-4 py-3">{r.serviceName}</td>
                                        <td className="px-4 py-3">{new Date(r.serviceDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{Number(r.amountPaid).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {dailyData.length > 0 && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
                                        <td className="px-4 py-3 font-bold text-gray-800">{Number(dailyTotal).toLocaleString()} RWF</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {dailyTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                            <span>Page {dailyPage} of {dailyTotalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setDailyPage(p => Math.max(1, p - 1))} disabled={dailyPage === 1} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Prev</button>
                                <button onClick={() => setDailyPage(p => Math.min(dailyTotalPages, p + 1))} disabled={dailyPage === dailyTotalPages} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
