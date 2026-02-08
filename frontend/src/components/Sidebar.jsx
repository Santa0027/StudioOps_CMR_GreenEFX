import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isExpanded, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (itemName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const navItems = [
    { name: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H2z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    ), path: '/dashboard' },
     { name: 'Enquiry Management', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H2z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    ), path: '/enquiries' },
    {
      name: 'Users Management',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      ),
      subItems: [
        { name: 'Users', path: '/users' },
        { name: 'Permissions & Roles', path: '/permissions' },
        // Attendance and Monthly Calendar are now integrated into User Management page
      ],
    },
    { name: 'Client Management', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ), path: '/clients' },
    { name: 'Lead Management', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0115 11h2a5 5 0 015 5v1h-2.07a6.97 6.97 0 00-4.33-1.5zM3 11a5 5 0 015-5h2a5 5 0 015 5v1H3v-1z" />
      </svg>
    ), path: '/leads' },
    {
      name: 'Projects',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm10-6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
        </svg>
      ),
      subItems: [
        { name: 'All Projects', path: '/projects' },
        // { name: 'Reassign User', path: '/projects/reassign-user' },
        { name: 'Project Status', path: '/projects/status' },
      ],
    },
    { name: 'Tasks Overview', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
    ), path: '/tasks' },
    {
      name: 'Finance & Billing',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h10V8.414L12.586 5A2 2 0 0012 4.414V4H6zm0 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      subItems: [
        { name: 'Invoices', path: '/invoice' },
        { name: 'Payments', path: '/finance-billing/payments' },
        { name: 'Reports', path: '/finance-billing/reports' },
      ],
    },
    { name: 'Reports & Analysis', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM11 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
      </svg>
    ), path: '/reports' },
    { name: 'Notifications', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ), path: '/notifications' },
    { name: 'Asset Library', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ), path: '/asset-library' },
    {
      name: 'Master Modules',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09z"></path>
        </svg>
      ),
      subItems: [
        { name: 'Package Management', path: '/master/packages' },
        { name: 'Workflow Template Management', path: '/master/workflow-templates' },
        {name : 'services', path: '/services'},
      ],
    },
    {
      name: 'System Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.16-1.7-1.16-2.08 0L7.12 6.5c-.24.73-.91 1.25-1.76 1.34-1.22.12-1.22 1.84 0 1.96.85.09 1.52.61 1.76 1.34l2.29 3.33c.38 1.16 1.7 1.16 2.08 0l2.29-3.33c.24-.73.91-1.25 1.76-1.34 1.22-.12 1.22-1.84 0-1.96-.85-.09-1.52-.61-1.76-1.34l-2.29-3.33zM10 2a1 1 0 00-1 1v2a1 1 0 102 0V3a1 1 0 00-1-1zm0 13a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1zM3 10a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zm13 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      subItems: [
        { name: 'Organization Settings', path: '/settings/organization' },
        { name: 'Email & Branding', path: '/settings/email-branding' },
        { name: 'Integrations', path: '/settings/integrations' },
      ],
    },
  ];

  return (
    <div 
        className={`bg-slate-900 h-screen flex flex-col border-r border-slate-800 relative transition-all duration-300 ease-in-out z-20 ${isExpanded ? 'w-64' : 'w-20'}`}
        role="navigation"
    >
      {/* Header / Brand */}
      <div className={`flex items-center h-20 px-6 ${!isExpanded && 'justify-center px-0'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
          <span className="text-white font-bold text-lg leading-none">SO</span>
        </div>
        {isExpanded && (
          <div className="ml-3 overflow-hidden ml-3">
            <h2 className="text-lg font-bold text-white tracking-wide whitespace-nowrap">StudioOps</h2>
            <p className="text-slate-400 text-xs font-medium tracking-wider uppercase">Workspace</p>
          </div>
        )}
      </div>

      <nav className="flex-grow overflow-y-auto custom-scrollbar pt-2 px-3 pb-6 space-y-1">
          {navItems.map((item) => {
            const isItemActive = (item.subItems && (
                item.subItems.some(sub => location.pathname === sub.path) ||
                (item.name === 'Projects' && location.pathname.startsWith('/projects')) ||
                (item.name === 'Users Management' && location.pathname.startsWith('/users')) ||
                (item.name === 'Finance & Billing' && (location.pathname.startsWith('/finance-billing') || location.pathname.startsWith('/invoice'))) ||
                (item.name === 'Master Modules' && location.pathname.startsWith('/master')) ||
                (item.name === 'System Settings' && location.pathname.startsWith('/settings'))
            )) || location.pathname === item.path;

            const isSubMenuExpanded = expandedMenus[item.name];

            return (
                <div key={item.name} className="mb-1">
                    {item.subItems ? (
                        <>
                            <div
                                onClick={() => isExpanded && toggleMenu(item.name)}
                                className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                                    ${isItemActive 
                                        ? 'bg-blue-600/10 text-blue-400' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                    ${!isExpanded && 'justify-center'}
                                `}
                            >
                                <span className={`flex-shrink-0 transition-colors ${isItemActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {item.icon}
                                </span>
                                
                                {isExpanded && (
                                    <>
                                        <span className="ml-3 font-medium text-sm flex-1">{item.name}</span>
                                        <span className={`ml-2 transform transition-transform duration-200 ${isSubMenuExpanded ? 'rotate-180' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Submenu */}
                            {isExpanded && isSubMenuExpanded && (
                                <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1">
                                    {item.subItems.map(subItem => (
                                        <Link
                                            key={subItem.name}
                                            to={subItem.path}
                                            className={`block py-2 px-3 rounded-md text-sm font-medium transition-colors
                                                ${location.pathname === subItem.path 
                                                    ? 'text-white bg-slate-800' 
                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
                                            `}
                                        >
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            to={item.path}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                ${isItemActive 
                                    ? 'bg-blue-600 shadow-md shadow-blue-900/20 text-white' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                ${!isExpanded && 'justify-center'}
                            `}
                        >
                            <span className={`flex-shrink-0 transition-colors ${isItemActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {item.icon}
                            </span>
                            {isExpanded && <span className="ml-3 font-medium text-sm">{item.name}</span>}
                        </Link>
                    )}
                </div>
            );
          })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-8 -right-3 p-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white shadow-lg cursor-pointer z-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        {isExpanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Logout/Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 group ${!isExpanded && 'justify-center'}`}
        >
            <span className={`flex-shrink-0 ${!isExpanded ? 'mr-0' : 'mr-3'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
            </span>
            {isExpanded && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;