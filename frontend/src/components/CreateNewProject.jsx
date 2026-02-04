import React, { useState, useEffect } from 'react';
import { getClients, getProjectStageTemplates, createProject } from '../api/api';
import { useNavigate } from 'react-router-dom';

const CreateNewProject = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        project_type: 'single_service',
        service_type: 'graphic_design',
        priority: 'medium',
        status: 'not_started',
        start_date: '',
        due_date: '',
        budget: '',
        estimated_hours: '',
        initial_requirements: '',
        reference_links: '',
        workflow_templates: [], // Changed to an array
    });
    const [clients, setClients] = useState([]);
    const [workflowTemplates, setWorkflowTemplates] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientsRes = await getClients();
                setClients(clientsRes.data);
                const templatesRes = await getProjectStageTemplates();
                setWorkflowTemplates(templatesRes.data);
            } catch (err) {
                setError('Failed to fetch necessary data. Please try again later.');
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateChange = (e) => {
        const { value, checked } = e.target;
        const templateId = parseInt(value);
        setFormData(prev => {
            const currentTemplates = prev.workflow_templates;
            if (checked) {
                return { ...prev, workflow_templates: [...currentTemplates, templateId] };
            } else {
                return { ...prev, workflow_templates: currentTemplates.filter(id => id !== templateId) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const projectData = {
            ...formData,
            workflow_template_ids: formData.workflow_templates, // Changed to plural and send the array
        };
        // Remove the old single template property if it exists
        delete projectData.workflow_templates;


        try {
            const res = await createProject(projectData);
            setSuccess('Project created successfully!');
            setTimeout(() => {
                navigate(`/projects/${res.data.id}`);
            }, 1000);
        } catch (err) {
            setError('Failed to create project. Please check the form and try again.');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto p-8 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
            {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-500 text-white p-3 rounded mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Project Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Client */}
                    <div>
                        <label htmlFor="client" className="block text-sm font-medium mb-1">Client</label>
                        <select
                            name="client"
                            id="client"
                            value={formData.client}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.client_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Project Type */}
                    <div>
                        <label htmlFor="project_type" className="block text-sm font-medium mb-1">Project Type</label>
                        <select
                            name="project_type"
                            id="project_type"
                            value={formData.project_type}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="single_service">Single Service</option>
                            <option value="package">Package</option>
                        </select>
                    </div>

                    {/* Service Type */}
                    <div>
                        <label htmlFor="service_type" className="block text-sm font-medium mb-1">Service Type</label>
                        <select
                            name="service_type"
                            id="service_type"
                            value={formData.service_type}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="3d_animation">3D Animation</option>
                            <option value="graphic_design">Graphic Design</option>
                            <option value="video_editing">Video Editing</option>
                            <option value="motion_graphics">Motion Graphics</option>
                            <option value="vfx">VFX</option>
                            <option value="package">Package</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            name="priority"
                            id="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-medium mb-1">Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            id="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Budget */}
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium mb-1">Budget</label>
                        <input
                            type="number"
                            name="budget"
                            id="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Estimated Hours */}
                    <div>
                        <label htmlFor="estimated_hours" className="block text-sm font-medium mb-1">Estimated Hours</label>
                        <input
                            type="number"
                            name="estimated_hours"
                            id="estimated_hours"
                            value={formData.estimated_hours}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Workflow Template */}
                    {/* Workflow Templates */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Workflow Stages</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-800 border border-gray-700 rounded-md">
                        {workflowTemplates.map(template => (
                            <div key={template.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`template-${template.id}`}
                                    name="workflow_templates"
                                    value={template.id}
                                    checked={formData.workflow_templates.includes(template.id)}
                                    onChange={handleTemplateChange}
                                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`template-${template.id}`} className="ml-2 text-sm">
                                    {template.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                </div>



                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                {/* Initial Requirements */}
                <div>
                    <label htmlFor="initial_requirements" className="block text-sm font-medium mb-1">Initial Requirements</label>
                    <textarea name="initial_requirements" id="initial_requirements" value={formData.initial_requirements} onChange={handleChange} rows="3" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                {/* Reference Links */}
                <div>
                    <label htmlFor="reference_links" className="block text-sm font-medium mb-1">Reference Links</label>
                    <textarea name="reference_links" id="reference_links" value={formData.reference_links} onChange={handleChange} rows="3" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <div className="flex justify-end">
                    <button type="button" onClick={() => navigate('/projects')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateNewProject;
