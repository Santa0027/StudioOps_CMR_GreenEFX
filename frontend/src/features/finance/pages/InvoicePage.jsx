import React, { useState, useEffect } from 'react';

const InvoicePage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch invoices from the API
        const fetchInvoices = async () => {
            try {
                const response = await fetch('/api/finance/invoices/');
                const data = await response.json();
                setInvoices(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching invoices:', error);
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Invoices</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map(invoice => (
                    <div key={invoice.id} className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold">{invoice.invoice_number}</h2>
                        <p>Client: {invoice.client}</p>
                        <p>Total: {invoice.total_amount}</p>
                        <p>Status: {invoice.status}</p>
                        <p>Due Date: {invoice.due_date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvoicePage;