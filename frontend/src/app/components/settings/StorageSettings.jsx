import React, { useState, useEffect } from 'react';
import { HardDrive, Server, Cloud, Info } from 'lucide-react';




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
        const response = await apiClient.get('storage-settings/');
        // The API returns a list containing one object for singletons
        const settings = response.data[0]; 
        setNasPath(settings.nas_root_path || '');
        setS3BucketName(settings.s3_bucket_name || '');
        setS3Region(settings.s3_region || '');
        setDefaultSourceFileStorage(settings.default_source_file_storage || 'nas');
        setDefaultPreviewFileStorage(settings.default_preview_file_storage || 'local');
        setDefaultFinalFileStorage(settings.default_final_file_storage || 'cloud');
      } catch (err) {
        console.error('Error fetching storage settings:', err);
        setError('Failed to load storage settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []); // Empty dependency array means this runs once on mount


  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch('storage-settings/', { // Use patch for partial update
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
    return <div className="text-white">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
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
                **Default for Review Assets:** Files with role 'preview' or 'final', and general 'image' or 'video' types (if not source).
                Also used for internal documents like lead attachments, quotations (PDFs), and payslips.
                Stored on the Django application server's local filesystem (`backend/media/`).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HardDrive size={20} className="text-purple-500 mt-1" />
            <div>
              <p className="text-lg font-semibold text-white">NAS Server (Network Attached Storage)</p>
              <p className="text-slate-400 mb-2">
                **Default for Source Files & Project Files:** Files with role 'source', and specific asset types like
                'psd' (Photoshop), 'ai' (Illustrator), 'ae' (After Effects), 'pr' (Premiere Pro).
                This ensures high-performance access for creative professionals.
              </p>
              <label htmlFor="default-source-storage" className="block text-sm font-medium text-slate-400 mt-3">
                Default Source File Storage:
              </label>
              <select
                id="default-source-storage"
                value={defaultSourceFileStorage}
                onChange={(e) => setDefaultSourceFileStorage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {STORAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="nas-path" className="block text-sm font-medium text-slate-400 mt-3">
                NAS Root Path:
              </label>
              <input
                type="text"
                id="nas-path"
                value={nasPath}
                onChange={(e) => setNasPath(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="/mnt/StudioOps"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cloud size={20} className="text-cyan-500 mt-1" />
            <div>
              <p className="text-lg font-semibold text-white">Cloud Server (S3 Compatible)</p>
              <p className="text-slate-400 mb-2">
                Used for scalable, durable storage, often for final deliverables or backups. Access
                is secured via presigned URLs generated on demand. Configuration details (AWS keys,
                bucket name) are managed securely on the backend.
              </p>
              <label htmlFor="default-preview-storage" className="block text-sm font-medium text-slate-400 mt-3">
                Default Preview File Storage:
              </label>
              <select
                id="default-preview-storage"
                value={defaultPreviewFileStorage}
                onChange={(e) => setDefaultPreviewFileStorage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {STORAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="default-final-storage" className="block text-sm font-medium text-slate-400 mt-3">
                Default Final File Storage:
              </label>
              <select
                id="default-final-storage"
                value={defaultFinalFileStorage}
                onChange={(e) => setDefaultFinalFileStorage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {STORAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="s3-bucket-name" className="block text-sm font-medium text-slate-400 mt-3">
                S3 Bucket Name:
              </label>
              <input
                type="text"
                id="s3-bucket-name"
                value={s3BucketName}
                onChange={(e) => setS3BucketName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your-s3-bucket-name"
              />
              <label htmlFor="s3-region" className="block text-sm font-medium text-slate-400 mt-3">
                S3 Region:
              </label>
              <input
                type="text"
                id="s3-region"
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="us-east-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Configuration (Optional - Admin only) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Manual Configuration</h2>
        <p className="text-slate-400 mb-4">
          (Note: Direct editing of sensitive credentials here is not recommended for security.
          This section could be extended to allow admin users to toggle features or view status.)
        </p>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl font-semibold text-blue-300 bg-blue-800/20 hover:bg-blue-800/30 transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default StorageSettings;