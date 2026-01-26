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
    <div className={`bg-[#1C1C1E] h-screen p-6 flex flex-col rounded-r-lg shadow-lg relative transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20 items-center'}`}>
      <div className={`flex items-center mb-10 ${!isExpanded && 'justify-center'}`}>
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">SO</span>
        </div>
        {isExpanded && (
          <div>
            <h2 className="text-xl font-bold text-white">StudioOps</h2>
            <p className="text-gray-400 text-sm">Workflow System</p>
          </div>
        )}
      </div>

      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-4">
              {item.subItems ? (
                <div>
                  <div
                    className={`flex items-center p-3 rounded-lg text-white font-medium hover:bg-gray-700 transition-colors duration-200 cursor-pointer
                      ${(item.name === 'Projects' && location.pathname.startsWith('/projects')) ||
                        (item.name === 'Users Management' && location.pathname.startsWith('/users')) ||
                        (item.name === 'Finance & Billing' && (location.pathname.startsWith('/finance-billing') || location.pathname.startsWith('/invoice'))) ||
                        (item.name === 'Master Modules' && location.pathname.startsWith('/master')) || // New active state check
                        (item.name === 'System Settings' && location.pathname.startsWith('/settings')) ||
                        (item.subItems.some(subItem => location.pathname === subItem.path))
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400'}
                      ${!isExpanded && 'justify-center'}`}
                    onClick={() => isExpanded && toggleMenu(item.name)}
                  >
                    <span className={`mr-4 ${!isExpanded && 'mr-0'}`}>
                      {item.icon}
                    </span>
                    {isExpanded && item.name}
                    {isExpanded && item.subItems && (
                      <span className="ml-auto">
                        {expandedMenus[item.name] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  {isExpanded && expandedMenus[item.name] && (
                    <ul className="ml-6 mt-2 space-y-2">
                      {item.subItems.map(subItem => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center p-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200
                              ${location.pathname === subItem.path ? 'text-blue-400' : 'text-gray-400'}`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg text-white font-medium hover:bg-gray-700 transition-colors duration-200
                    ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400'}
                    ${!isExpanded && 'justify-center'}`}
                >
                  <span className={`mr-4 ${!isExpanded && 'mr-0'}`}>
                    {item.icon}
                  </span>
                  {isExpanded && item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 p-1 bg-gray-700 rounded-full text-white focus:outline-none z-10"
      >
        {isExpanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-lg text-red-400 font-medium hover:bg-gray-700 transition-colors duration-200 ${!isExpanded && 'justify-center'}`}
        >
          <span className={`mr-4 ${!isExpanded && 'mr-0'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </span>
          {isExpanded && 'Logout'}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;