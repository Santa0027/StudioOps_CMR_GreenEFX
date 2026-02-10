import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HardDrive, FolderKanban, Cloud } from 'lucide-react';

function Settings() {
  const location = useLocation();

  const navItems = [
    { name: 'Storage Settings', path: 'storage', icon: HardDrive },
    { name: 'Folder Templates', path: 'folder-templates', icon: FolderKanban },
    // Add more settings categories here
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-900 text-white">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-950 border-r border-slate-800 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6 text-blue-500">Settings</h2>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg text-lg transition-colors
                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Render sub-route components here */}
      </div>
    </div>
  );
}

export default Settings;
