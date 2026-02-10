import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans anti-aliased selection:bg-blue-500 selection:text-white">
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
      <main 
        className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative transition-all duration-300 ease-soft-spring"
        role="main"
      >
        <div className="max-w-7xl mx-auto w-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
