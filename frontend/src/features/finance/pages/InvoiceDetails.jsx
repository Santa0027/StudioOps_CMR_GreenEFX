import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInvoice, createPayment, deletePayment } from '../../../shared/services/apiClient';
import { 
    ArrowLeft, 
    Download, 
    CreditCard, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Hash,
    Plus,
    X,
    Banknote,
    MessageSquare,
    Edit,
    Trash2,
    FileText
} from 'lucide-react';

const InvoiceDetails = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        transaction_id: '',
        notes: ''
    });

    const fetchInvoiceDetails = async () => {
        setLoading(true);
        try {
            const response = await getInvoice(invoiceId);
            setInvoice(response.data);
            setPaymentData(prev => ({ ...prev, amount: response.data.balance_due }));
        } catch (err) {
            console.error("Failed to fetch invoice:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceDetails();
    }, [invoiceId]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        try {
            await createPayment({
                invoice: invoiceId,
                ...paymentData
            });
            setShowPaymentModal(false);
            fetchInvoiceDetails();
            alert("Payment recorded successfully!");
        } catch (err) {
            alert("Failed to record payment. Please check balance.");
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm("Are you sure you want to delete this payment record? This will revert the invoice balance.")) return;
        try {
            await deletePayment(paymentId);
            fetchInvoiceDetails();
        } catch (err) {
            alert("Failed to delete payment.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!invoice) return <div className="text-white">Invoice not found.</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={14}/> PAID</span>;
            case 'Partial': return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5"><Clock size={14}/> PARTIAL</span>;
            case 'Overdue': return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5"><AlertCircle size={14}/> OVERDUE</span>;
            default: return <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">PENDING</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoice')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Invoice #{invoice.invoice_number}</h1>
                            {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-slate-400 mt-1">Issued to {invoice.client_name} on {invoice.invoice_date}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link 
                        to={`/invoice/${invoiceId}/edit`}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
                    >
                        <Edit size={18} /> Edit
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all">
                        <Download size={18} /> Download PDF
                    </button>
                    {invoice.status !== 'Paid' && (
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
                        >
                            <CreditCard size={18} /> Record Payment
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Invoice Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit Price</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {invoice.items?.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white">{item.description}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 text-center">{parseFloat(item.quantity)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 text-right">${parseFloat(item.unit_price).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-white text-right">${parseFloat(item.total).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="bg-slate-950/50 p-8 space-y-3">
                            <div className="flex justify-end gap-12">
                                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Subtotal</span>
                                <span className="text-white font-bold text-sm">${parseFloat(invoice.total_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-end gap-12">
                                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Amount Paid</span>
                                <span className="text-emerald-400 font-bold text-sm">-${parseFloat(invoice.paid_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-end gap-12 pt-3 border-t border-slate-800">
                                <span className="text-blue-400 font-black text-sm uppercase tracking-widest">Balance Due</span>
                                <span className="text-white font-black text-2xl tracking-tighter">${parseFloat(invoice.balance_due).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-slate-500" size={20} /> Payment History
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {invoice.payments?.length === 0 ? (
                                <div className="p-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl text-center text-slate-500">
                                    No payments recorded yet.
                                </div>
                            ) : (
                                invoice.payments.map((p) => (
                                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                <Banknote size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">${parseFloat(p.amount).toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">{p.payment_method} • {p.payment_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Transaction ID</p>
                                                <p className="text-xs font-mono text-slate-300">{p.transaction_id || 'N/A'}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeletePayment(p.id)}
                                                className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-4">Invoice Information</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Client</p>
                                <p className="text-sm text-white font-medium">{invoice.client_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Project</p>
                                <p className="text-sm text-blue-400 font-medium">{invoice.project_name || 'General Services'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Due Date</p>
                                <p className="text-sm text-white font-medium flex items-center gap-2">
                                    <Calendar size={14} className="text-rose-400" /> {invoice.due_date}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <button className="w-full text-left p-3 rounded-xl hover:bg-blue-500/10 text-slate-300 text-sm font-medium transition-colors flex items-center gap-2">
                                <MessageSquare size={16} className="text-blue-500" /> Send Reminder to Client
                            </button>
                            <button className="w-full text-left p-3 rounded-xl hover:bg-blue-500/10 text-slate-300 text-sm font-medium transition-colors flex items-center gap-2">
                                <FileText size={16} className="text-blue-500" /> Create Credit Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Record Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Method</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={paymentData.payment_method}
                                    onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Check">Check</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction ID / Ref</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                                    placeholder="Bank reference number..."
                                    value={paymentData.transaction_id}
                                    onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={paymentLoading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all mt-4 disabled:opacity-50"
                            >
                                {paymentLoading ? 'Saving...' : 'Confirm Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetails;
