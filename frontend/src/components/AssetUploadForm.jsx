import React, { useState, useEffect } from 'react';
import { X, UploadCloud, HardDrive, Globe, Server, FileText } from 'lucide-react';
import { uploadAssetForStageElement } from '../api/api'; // Assuming uploadAssetForStageElement API call exists

const AssetUploadForm = ({ onClose, onAssetUploaded, projectStageElementId }) => {
  const [file, setFile] = useState(null);
  const [assetType, setAssetType] = useState('');
  const [assetRole, setAssetRole] = useState('');
  const [storageLocation, setStorageLocation] = useState('nas'); // Default to NAS
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const ASSET_TYPE_CHOICES = [
    { value: 'psd', label: 'Photoshop' },
    { value: 'ai', label: 'Illustrator' },
    { value: 'ae', label: 'After Effects' },
    { value: 'pr', label: 'Premiere Pro' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'other', label: 'Other' },
  ];

  const ASSET_ROLE_CHOICES = [
    { value: 'source', label: 'Source File' },
    { value: 'preview', label: 'Preview Render' },
    { value: 'final', label: 'Final Deliverable' },
  ];

  const STORAGE_LOCATION_CHOICES = [
    { value: 'nas', label: 'NAS Server', icon: <HardDrive size={16} /> },
    { value: 'local', label: 'Local Server', icon: <Server size={16} /> },
    { value: 'cloud', label: 'Cloud Server', icon: <Globe size={16} /> },
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setValidationErrors(prev => ({ ...prev, file: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "assetType") setAssetType(value);
    if (name === "assetRole") setAssetRole(value);
    if (name === "storageLocation") setStorageLocation(value);
    if (name === "description") setDescription(value);
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  };

  useEffect(() => {
    // Logic to set default storage based on assetType and assetRole
    if (assetRole === 'preview' || assetRole === 'final') { // Assuming 'review' is represented by preview/final assets stored locally for client review
        setStorageLocation('local');
    } else if (assetRole === 'source' || ['psd', 'ai', 'ae', 'pr', 'video'].includes(assetType)) {
        // Source files and project files typically go to NAS
        setStorageLocation('nas');
    } else {
        // Fallback to a default, perhaps 'nas' or 'local' based on general policy
        setStorageLocation('nas');
    }
  }, [assetType, assetRole]); // Re-run when assetType or assetRole changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const errors = {};
    if (!file) errors.file = 'File is required.';
    if (!assetType) errors.assetType = 'Asset type is required.';
    if (!assetRole) errors.assetRole = 'Asset role is required.';
    if (!storageLocation) errors.storageLocation = 'Storage location is required.';
    if (!projectStageElementId) errors.projectStageElementId = 'Project Stage Element ID is missing.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    const uploadData = new FormData();
    uploadData.append('element', projectStageElementId);
    uploadData.append('file', file);
    uploadData.append('asset_type', assetType);
    uploadData.append('asset_role', assetRole);
    uploadData.append('storage_location', storageLocation);
    uploadData.append('description', description);

    try {
      await uploadAssetForStageElement(projectStageElementId, uploadData); // This API call needs to be created
      if (onAssetUploaded) onAssetUploaded();
      onClose();
    } catch (err) {
      setError('Failed to upload asset. Please check the form and try again.');
      console.error(err);
      if (err.response && err.response.data) {
        setValidationErrors(err.response.data); // Display backend validation errors
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <UploadCloud size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload New Asset</h2>
            <p className="text-sm text-slate-400">Attach a file to your project task</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
          {error}
        </div>
      )}
      {validationErrors.non_field_errors && (
        <div className="mx-6 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
          {validationErrors.non_field_errors}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* File Upload */}
        <div>
          <label htmlFor="file" className={labelClasses}>
            <FileText size={14} />
            Select File *
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className={`${inputClasses} block w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500/20 file:text-blue-400
              hover:file:bg-blue-500/30
              ${validationErrors.file ? 'border-rose-500' : ''}`}
            required
          />
          {validationErrors.file && <p className="text-rose-500 text-sm mt-1">{validationErrors.file}</p>}
        </div>

        {/* Asset Type */}
        <div>
          <label htmlFor="assetType" className={labelClasses}>
            <FileText size={14} />
            Asset Type *
          </label>
          <select
            name="assetType"
            id="assetType"
            value={assetType}
            onChange={handleChange}
            className={`${inputClasses} ${validationErrors.asset_type ? 'border-rose-500' : ''} cursor-pointer`}
            required
          >
            <option value="">Select Asset Type</option>
            {ASSET_TYPE_CHOICES.map(choice => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
          {validationErrors.asset_type && <p className="text-rose-500 text-sm mt-1">{validationErrors.asset_type}</p>}
        </div>

        {/* Asset Role */}
        <div>
          <label htmlFor="assetRole" className={labelClasses}>
            <FileText size={14} />
            Asset Role *
          </label>
          <select
            name="assetRole"
            id="assetRole"
            value={assetRole}
            onChange={handleChange}
            className={`${inputClasses} ${validationErrors.asset_role ? 'border-rose-500' : ''} cursor-pointer`}
            required
          >
            <option value="">Select Asset Role</option>
            {ASSET_ROLE_CHOICES.map(choice => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
          {validationErrors.asset_role && <p className="text-rose-500 text-sm mt-1">{validationErrors.asset_role}</p>}
        </div>

        {/* Storage Location */}
        <div>
          <label htmlFor="storageLocation" className={labelClasses}>
            <UploadCloud size={14} />
            Storage Location *
          </label>
          <select
            name="storageLocation"
            id="storageLocation"
            value={storageLocation}
            onChange={handleChange}
            className={`${inputClasses} ${validationErrors.storage_location ? 'border-rose-500' : ''} cursor-pointer`}
            required
          >
            {STORAGE_LOCATION_CHOICES.map(choice => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
          {validationErrors.storage_location && <p className="text-rose-500 text-sm mt-1">{validationErrors.storage_location}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClasses}>Description</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onChange={handleChange}
            rows="3"
            className={inputClasses + " resize-none"}
            placeholder="Optional: Description for the asset"
          />
        </div>

      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Asset'
          )}
        </button>
      </div>
    </div>
  );
};

export default AssetUploadForm;