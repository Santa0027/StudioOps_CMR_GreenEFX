import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createService, getService, updateService } from '../../api/api';

const ServiceForm = () => {
    const [service, setService] = useState({
        name: '',
        description: '',
        base_price: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); // Get service ID from URL for editing

    useEffect(() => {
        if (id) {
            fetchService(id);
        }
    }, [id]);

    const fetchService = async (serviceId) => {
        try {
            setLoading(true);
            const response = await getService(serviceId);
            setService(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch service details.');
            console.error('Error fetching service:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setService((prevService) => ({
            ...prevService,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (id) {
                await updateService(id, service);
            } else {
                await createService(service);
            }
            navigate('/services'); // Navigate back to the service list after success
        } catch (err) {
            setError('Failed to save service.');
            console.error('Error saving service:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Service' : 'Add New Service'}</h1>
            {loading && <div className="text-center py-4">Loading...</div>}
            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                        Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={service.name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                        Description:
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={service.description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="base_price" className="block text-gray-700 text-sm font-bold mb-2">
                        Base Price:
                    </label>
                    <input
                        type="number"
                        id="base_price"
                        name="base_price"
                        value={service.base_price}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        step="0.01"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Service'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/services')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceForm;