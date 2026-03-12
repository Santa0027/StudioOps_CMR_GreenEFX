import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClients, getProjects, getInvoice, updateInvoice } from '../../../shared/services/apiClient';
import { Save, X, Plus, Trash2, FileText, User, Briefcase } from 'lucide-react';

const EditInvoiceForm = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        client: '',
        project: '',
        invoice_number: '',
        invoice_date: '',
        due_date: '',
        items: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, pRes, iRes] = await Promise.all([
                    getClients(), 
                    getProjects(),
                    getInvoice(invoiceId)
                ]);
                setClients(cRes.data);
                setProjects(pRes.data);
                
                const inv = iRes.data;
                setFormData({
                    client: inv.client,
                    project: inv.project || '',
                    invoice_number: inv.invoice_number,
                    invoice_date: inv.invoice_date,
                    due_date: inv.due_date,
                    items: inv.items.map(item => ({
                        id: item.id,
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total: item.total
                    }))
                });
            } catch (err) {
                console.error("Failed to fetch data:", err);
                alert("Error loading invoice data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [invoiceId]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
        }
        
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const total = formData.items.reduce((sum, item) => sum + parseFloat(item.total), 0);
            const payload = { ...formData, total_amount: total };
            await updateInvoice(invoiceId, payload);
            navigate(`/invoice/${invoiceId}`);
        } catch (err) {
            alert("Failed to update invoice.");
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = formData.items.reduce((sum, item) => sum + parseFloat(item.total), 0);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-500" size={32} />
                        Edit Invoice #{formData.invoice_number}
                    </h1>
                    <p className="text-slate-400 mt-1">Modify billing details and line items.</p>
                </div>
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                    <X size={24} />
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} /> Client
                        </label>
                        <select 
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.client}
                            onChange={(e) => setFormData({...formData, client: e.target.value})}
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={12} /> Related Project
                        </label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.project}
                            onChange={(e) => setFormData({...formData, project: e.target.value})}
                        >
                            <option value="">None (General Billing)</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoice Number</label>
                        <input 
                            required
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                            value={formData.invoice_number}
                            onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                value={formData.invoice_date}
                                onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Qty</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Price</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Total</th>
                                <th className="px-6 py-4 text-right w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {formData.items.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-2">
                                        <input 
                                            required
                                            placeholder="Service or Product name..."
                                            className="w-full bg-transparent border-none text-white text-sm focus:ring-0"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            required
                                            type="number"
                                            className="w-full bg-transparent border-none text-white text-sm focus:ring-0"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            required
                                            type="number"
                                            className="w-full bg-transparent border-none text-white text-sm focus:ring-0"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">
                                        ${parseFloat(item.total).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button 
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-slate-950/30">
                        <button 
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                        >
                            <Plus size={14} /> Add Another Line Item
                        </button>
                    </div>
                </div>

                {/* Footer / Total */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
                        <h2 className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</h2>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            <Save size={20} />
                            {submitting ? 'Updating...' : 'Update Invoice'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditInvoiceForm;
