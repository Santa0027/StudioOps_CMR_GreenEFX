import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
      <main className={`flex-1 p-6 overflow-auto transition-all duration-300 ${isSidebarExpanded ? 'ml-0' : 'ml-[-16rem]'}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
