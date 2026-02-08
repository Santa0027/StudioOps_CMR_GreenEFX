import React, { useEffect, useState } from 'react';
import { getServices, deleteService } from '../../api/api';
import { Link, useNavigate } from 'react-router-dom'; // Assuming react-router-dom for navigation

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await getServices();
            setServices(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch services.');
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id);
                fetchServices(); // Refresh the list after deletion
            } catch (err) {
                setError('Failed to delete service.');
                console.error('Error deleting service:', err);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading services...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Services</h1>
            <div className="flex justify-end mb-4">
                <Link to="/services/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add New Service
                </Link>
            </div>
            {services.length === 0 ? (
                <p className="text-center text-gray-500">No services found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">Description</th>
                                <th className="py-2 px-4 text-left">Base Price</th>
                                <th className="py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {services.map((service) => (
                                <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-2 px-4">{service.name}</td>
                                    <td className="py-2 px-4">{service.description}</td>
                                    <td className="py-2 px-4">{service.base_price ? `$${parseFloat(service.base_price).toFixed(2)}` : 'N/A'}</td>
                                    <td className="py-2 px-4 text-center">
                                        <button
                                            onClick={() => navigate(`/services/edit/${service.id}`)}
                                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ServiceList;