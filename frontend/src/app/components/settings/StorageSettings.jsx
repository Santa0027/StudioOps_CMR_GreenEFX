import React from 'react';
import { HardDrive, Server, Cloud, Info } from 'lucide-react';

function StorageSettings() {
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
              <p className="text-slate-400">
                **Default for Source Files & Project Files:** Files with role 'source', and specific asset types like
                'psd' (Photoshop), 'ai' (Illustrator), 'ae' (After Effects), 'pr' (Premiere Pro).
                This ensures high-performance access for creative professionals. Configured at `/mnt/StudioOps`.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cloud size={20} className="text-cyan-500 mt-1" />
            <div>
              <p className="text-lg font-semibold text-white">Cloud Server (S3 Compatible)</p>
              <p className="text-slate-400">
                Used for scalable, durable storage, often for final deliverables or backups. Access
                is secured via presigned URLs generated on demand. Configuration details (AWS keys,
                bucket name) are managed securely on the backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Configuration (Optional - Admin only) */}
      {/* <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Manual Configuration</h2>
        <p className="text-slate-400 mb-4">
          (Note: Direct editing of sensitive credentials here is not recommended for security.
          This section could be extended to allow admin users to toggle features or view status.)
        </p>
        <button className="px-5 py-2.5 rounded-xl font-semibold text-blue-300 bg-blue-800/20 hover:bg-blue-800/30 transition-all">
          View Advanced Storage Options
        </button>
      </div> */}
    </div>
  );
}

export default StorageSettings;