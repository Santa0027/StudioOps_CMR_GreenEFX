import React, { useState, useEffect } from 'react';
import { getAssets, deleteAsset } from '../../../shared/services/apiClient';
import { 
    Folder, 
    File, 
    Search, 
    Filter, 
    Download, 
    Trash2, 
    Eye, 
    HardDrive, 
    Cloud, 
    Database,
    MoreVertical,
    CheckCircle2,
    Clock,
    FileVideo,
    FileImage,
    FileCode,
    FileArchive
} from 'lucide-react';

const AssetLibrary = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterStatus] = useState('All');
    const [storageFilter, setStorageFilter] = useState('All');

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await getAssets();
            setAssets(response.data);
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;
        try {
            await deleteAsset(id);
            fetchAssets();
        } catch (err) {
            alert("Failed to delete asset.");
        }
    };

    const getFileIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('video')) return <FileVideo className="text-purple-400" />;
        if (t.includes('image')) return <FileImage className="text-blue-400" />;
        if (t.includes('source')) return <FileCode className="text-amber-400" />;
        if (t.includes('zip') || t.includes('archive')) return <FileArchive className="text-emerald-400" />;
        return <File className="text-slate-400" />;
    };

    const getStorageIcon = (location) => {
        switch (location) {
            case 'cloud': return <Cloud size={14} className="text-blue-400" />;
            case 'nas': return <Database size={14} className="text-emerald-400" />;
            case 'local': return <HardDrive size={14} className="text-slate-400" />;
            default: return null;
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.file?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             asset.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || asset.asset_type === filterType;
        const matchesStorage = storageFilter === 'All' || asset.storage_location === storageFilter;
        return matchesSearch && matchesType && matchesStorage;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Folder className="text-blue-500" size={32} />
                    Asset Library
                </h1>
                <p className="text-slate-400 mt-1">Centralized repository for all project source files, previews, and final renders.</p>
            </header>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder="Search assets by filename or description..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
                        {['All', 'source', 'preview', 'final'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterStatus(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    filterType === type ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
                        {['All', 'cloud', 'nas', 'local'].map(loc => (
                            <button
                                key={loc}
                                onClick={() => setStorageFilter(loc)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    storageFilter === loc ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.length === 0 ? (
                    <div className="col-span-full bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center">
                        <Database className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">No assets found in the library.</p>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
                            {/* File Preview Placeholder */}
                            <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
                                {getFileIcon(asset.asset_type)}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                                        {asset.asset_type}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    {getStorageIcon(asset.storage_location)}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-bold text-white truncate" title={asset.file}>
                                            {asset.file?.split('/').pop()}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(asset.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                                            {asset.uploaded_by_name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            V{asset.version_number || 1}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a 
                                            href={asset.file} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                                        >
                                            <Eye size={16} />
                                        </a>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

export default AssetLibrary;
