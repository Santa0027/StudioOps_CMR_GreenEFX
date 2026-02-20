import React, { useState, useEffect } from 'react';
import { HardDrive, Server, Cloud, Info } from 'lucide-react';
import { getStorageSettings, updateStorageSettings } from '../../../shared/services/apiClient';

function StorageSettings() {
  const [nasPath, setNasPath] = useState('');
  const [s3BucketName, setS3BucketName] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [defaultSourceFileStorage, setDefaultSourceFileStorage] = useState('nas');
  const [defaultPreviewFileStorage, setDefaultPreviewFileStorage] = useState('local');
  const [defaultFinalFileStorage, setDefaultFinalFileStorage] = useState('cloud');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STORAGE_OPTIONS = [
    { value: 'local', label: 'Local Server' },
    { value: 'nas', label: 'NAS Server' },
    { value: 'cloud', label: 'Cloud Server (S3)' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getStorageSettings();
        // Handle both list and object responses for robustness
        const settings = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (settings) {
          setNasPath(settings.nas_root_path || '');
          setS3BucketName(settings.s3_bucket_name || '');
          setS3Region(settings.s3_region || '');
          setDefaultSourceFileStorage(settings.default_source_file_storage || 'nas');
          setDefaultPreviewFileStorage(settings.default_preview_file_storage || 'local');
          setDefaultFinalFileStorage(settings.default_final_file_storage || 'cloud');
        }
      } catch (err) {
        console.error('Error fetching storage settings:', err);
        setError('Failed to load storage settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateStorageSettings({
        nas_root_path: nasPath,
        s3_bucket_name: s3BucketName,
        s3_region: s3Region,
        default_source_file_storage: defaultSourceFileStorage,
        default_preview_file_storage: defaultPreviewFileStorage,
        default_final_file_storage: defaultFinalFileStorage,
      });
      console.log('Settings saved successfully:', response.data);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving storage settings:', err);
      setError('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          Loading settings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        <p className="text-rose-400">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4">Storage Settings</h1>
      <p className="text-slate-400">
        This section provides an overview of how project assets are stored. The system automatically
        determines the storage location (Local, NAS, or Cloud) based on the asset's type and role.
        For security, sensitive storage credentials are managed on the backend and not exposed here.
      </p>

      {/* Dynamic Storage Rules Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-blue-500" />
          Dynamic Storage Rules
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Server size={20} className="text-emerald-500 mt-1" />
            <div>
              <p className="text-lg font-semibold text-white">Local Server (Django Media)</p>
              <p className="text-slate-400">
                Default for review assets and internal documents. Stored on the application server's local filesystem.
              </p>
            </div>
          </div>
          
          <div className="space-y-6 mt-6 border-t border-slate-800 pt-6">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <HardDrive size={18} className="text-purple-500" />
                NAS Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="default-source-storage" className="block text-sm font-medium text-slate-400 mb-1">
                    Default Source File Storage:
                  </label>
                  <select
                    id="default-source-storage"
                    value={defaultSourceFileStorage}
                    onChange={(e) => setDefaultSourceFileStorage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {STORAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="nas-path" className="block text-sm font-medium text-slate-400 mb-1">
                    NAS Root Path:
                  </label>
                  <input
                    type="text"
                    id="nas-path"
                    value={nasPath}
                    onChange={(e) => setNasPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="/mnt/StudioOps"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Cloud size={18} className="text-cyan-500" />
                Cloud (S3) Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="default-preview-storage" className="block text-sm font-medium text-slate-400 mb-1">
                    Default Preview File Storage:
                  </label>
                  <select
                    id="default-preview-storage"
                    value={defaultPreviewFileStorage}
                    onChange={(e) => setDefaultPreviewFileStorage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {STORAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="default-final-storage" className="block text-sm font-medium text-slate-400 mb-1">
                    Default Final File Storage:
                  </label>
                  <select
                    id="default-final-storage"
                    value={defaultFinalFileStorage}
                    onChange={(e) => setDefaultFinalFileStorage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {STORAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="s3-bucket-name" className="block text-sm font-medium text-slate-400 mb-1">
                    S3 Bucket Name:
                  </label>
                  <input
                    type="text"
                    id="s3-bucket-name"
                    value={s3BucketName}
                    onChange={(e) => setS3BucketName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="your-s3-bucket-name"
                  />
                </div>
                <div>
                  <label htmlFor="s3-region" className="block text-sm font-medium text-slate-400 mb-1">
                    S3 Region:
                  </label>
                  <input
                    type="text"
                    id="s3-region"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="us-east-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Manual Configuration</h2>
          <p className="text-slate-400 text-sm">Update the global storage parameters for all new assets.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default StorageSettings;
