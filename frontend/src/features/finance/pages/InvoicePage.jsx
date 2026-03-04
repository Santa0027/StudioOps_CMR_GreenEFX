import React, { useState, useEffect } from 'react';
import { getInvoices, getFinanceSummary, deleteInvoice } from '../../../shared/services/apiClient';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Trash2, Eye, Search, Filter, TrendingUp, CreditCard, Clock } from 'lucide-react';

const InvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, summaryRes] = await Promise.all([
                getInvoices(),
                getFinanceSummary()
            ]);
            setInvoices(invoicesRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error('Error fetching finance data:', err);
            setError('Failed to load financial records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await deleteInvoice(id);
            fetchData();
        } catch (err) {
            alert("Failed to delete invoice.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Partial': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Overdue': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-500" size={32} />
                        Invoices & Billing
                    </h1>
                    <p className="text-slate-400 mt-1">Manage client billing and track incoming revenue.</p>
                </div>
                <Link
                    to="/invoice/create"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
                >
                    <Plus size={20} />
                    Create Invoice
                </Link>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Invoiced</p>
                    <h3 className="text-3xl font-bold text-white">${summary?.total_invoiced?.toLocaleString() || '0.00'}</h3>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">{summary?.count || 0} Invoices</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-500">
                        <CreditCard size={80} />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Collected</p>
                    <h3 className="text-3xl font-bold text-emerald-400">${summary?.total_paid?.toLocaleString() || '0.00'}</h3>
                    <p className="text-slate-500 text-xs mt-4">Actual revenue in bank</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-amber-500">
                        <Clock size={80} />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Outstanding Balance</p>
                    <h3 className="text-3xl font-bold text-amber-400">${summary?.total_pending?.toLocaleString() || '0.00'}</h3>
                    <p className="text-slate-500 text-xs mt-4">Awaiting payment</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by invoice # or client name..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
                    {['All', 'Paid', 'Pending', 'Partial', 'Overdue'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                filterStatus === status ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Invoice</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Client / Project</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic font-medium">
                                    No invoices found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">#{inv.invoice_number}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Due: {inv.due_date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-200">{inv.client_name}</span>
                                            <span className="text-[10px] text-slate-500 italic">{inv.project_name || 'No Project Linked'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">${parseFloat(inv.total_amount).toLocaleString()}</span>
                                            {parseFloat(inv.paid_amount) > 0 && (
                                                <span className="text-[10px] text-emerald-500 font-bold tracking-tighter">Paid: ${parseFloat(inv.paid_amount).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <Link to={`/invoice/${inv.id}`} className="inline-flex p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                                            <Eye size={16} />
                                        </Link>
                                        <Link to={`/invoice/${inv.id}/edit`} className="inline-flex p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                                            <FileText size={16} />
                                        </Link>
                                        <button className="inline-flex p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(inv.id)}
                                            className="inline-flex p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicePage;
