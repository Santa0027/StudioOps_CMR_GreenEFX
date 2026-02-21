import React, { useState, useEffect } from 'react';
import { HardDrive, Server, Cloud, Info, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { getStorageSettings, updateStorageSettings, testNasConnection, testS3Connection } from '../../../shared/services/apiClient';

function StorageSettings() {
  const [nasPath, setNasPath] = useState('');
  const [s3BucketName, setS3BucketName] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [defaultSourceFileStorage, setDefaultSourceFileStorage] = useState('nas');
  const [defaultPreviewFileStorage, setDefaultPreviewFileStorage] = useState('local');
  const [defaultFinalFileStorage, setDefaultFinalFileStorage] = useState('cloud');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test states
  const [testingNas, setTestingNas] = useState(false);
  const [testingS3, setTestingS3] = useState(false);
  const [nasTestResult, setNasTestResult] = useState(null);
  const [s3TestResult, setS3TestResult] = useState(null);

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
      await updateStorageSettings({
        nas_root_path: nasPath,
        s3_bucket_name: s3BucketName,
        s3_region: s3Region,
        default_source_file_storage: defaultSourceFileStorage,
        default_preview_file_storage: defaultPreviewFileStorage,
        default_final_file_storage: defaultFinalFileStorage,
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving storage settings:', err);
      setError('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNas = async () => {
    setTestingNas(true);
    setNasTestResult(null);
    try {
      const res = await testNasConnection({ nas_root_path: nasPath });
      setNasTestResult({ success: true, message: res.data.detail });
    } catch (err) {
      setNasTestResult({ 
        success: false, 
        message: err.response?.data?.detail || "NAS connection failed. Ensure the path is correct and accessible." 
      });
    } finally {
      setTestingNas(false);
    }
  };

  const handleTestS3 = async () => {
    setTestingS3(true);
    setS3TestResult(null);
    try {
      const res = await testS3Connection({ s3_bucket_name: s3BucketName, s3_region: s3Region });
      setS3TestResult({ success: true, message: res.data.detail });
    } catch (err) {
      setS3TestResult({ 
        success: false, 
        message: err.response?.data?.detail || "S3 connection failed. Verify your bucket name, region, and server credentials." 
      });
    } finally {
      setTestingS3(false);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4">Storage Settings</h1>
      <p className="text-slate-400">
        This section provides an overview of how project assets are stored. The system automatically
        determines the storage location (Local, NAS, or Cloud) based on the asset's type and role.
      </p>

      {/* Dynamic Storage Rules Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-blue-500" />
          Configuration & Connectivity
        </h2>
        
        <div className="space-y-8">
          {/* NAS Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HardDrive size={18} className="text-purple-500" />
                NAS Configuration
              </h3>
              <button
                onClick={handleTestNas}
                disabled={testingNas || !nasPath}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all border border-slate-700 disabled:opacity-50"
              >
                {testingNas ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Test NAS Path
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Default Source Storage:</label>
                <select
                  value={defaultSourceFileStorage}
                  onChange={(e) => setDefaultSourceFileStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                >
                  {STORAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">NAS Root Path:</label>
                <input
                  type="text"
                  value={nasPath}
                  onChange={(e) => setNasPath(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                  placeholder="/mnt/StudioOps"
                />
              </div>
            </div>

            {nasTestResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${nasTestResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {nasTestResult.success ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
                <span>{nasTestResult.message}</span>
              </div>
            )}
          </div>

          {/* S3 Section */}
          <div className="space-y-4 border-t border-slate-800 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Cloud size={18} className="text-cyan-500" />
                Cloud (S3) Configuration
              </h3>
              <button
                onClick={handleTestS3}
                disabled={testingS3 || !s3BucketName}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all border border-slate-700 disabled:opacity-50"
              >
                {testingS3 ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Test S3 Bucket
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Default Preview Storage:</label>
                <select
                  value={defaultPreviewFileStorage}
                  onChange={(e) => setDefaultPreviewFileStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                >
                  {STORAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Default Final Storage:</label>
                <select
                  value={defaultFinalFileStorage}
                  onChange={(e) => setDefaultFinalFileStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                >
                  {STORAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">S3 Bucket Name:</label>
                <input
                  type="text"
                  value={s3BucketName}
                  onChange={(e) => setS3BucketName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                  placeholder="bucket-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">S3 Region:</label>
                <input
                  type="text"
                  value={s3Region}
                  onChange={(e) => setS3Region(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white sm:text-sm"
                  placeholder="us-east-1"
                />
              </div>
            </div>

            {s3TestResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${s3TestResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {s3TestResult.success ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
                <span>{s3TestResult.message}</span>
              </div>
            )}
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
