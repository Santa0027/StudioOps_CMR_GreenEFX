import React, { useState, useEffect } from 'react';
import { getPayments } from '../../../shared/services/apiClient';
import { CreditCard, Search, ArrowDownLeft, Calendar, User, Hash, Info } from 'lucide-react';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await getPayments();
                setPayments(response.data);
            } catch (err) {
                console.error('Error fetching payments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p => 
        p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoice?.toString().includes(searchTerm)
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <CreditCard className="text-emerald-500" size={32} />
                    Payment History
                </h1>
                <p className="text-slate-400 mt-1">Audit log of all incoming transactions and bank transfers.</p>
            </header>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text"
                    placeholder="Search by Transaction ID or Invoice #..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPayments.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center">
                        <Info className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">No payment records found.</p>
                    </div>
                ) : (
                    filteredPayments.map((payment) => (
                        <div key={payment.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                        <ArrowDownLeft size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-white">${parseFloat(payment.amount).toLocaleString()}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">Received</span>
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <Hash size={12} /> Transaction: {payment.transaction_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Method</span>
                                        <span className="text-sm text-slate-300 font-medium">{payment.payment_method}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Date</span>
                                        <span className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-500" />
                                            {payment.payment_date}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Invoice</span>
                                        <span className="text-sm text-blue-400 font-bold">#{payment.invoice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;
