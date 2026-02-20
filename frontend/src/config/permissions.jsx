
import React from 'react';

// SVG Icon Components
const SvgDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H2z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>
);

const SvgUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const SvgAttendance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14H8v-2h3v2zm0-4H8V8h3v4zm5 0h-3V8h3v4z"></path>
    <path d="M9 13H6v-2h3v2zm0-4H6V5h3v4z"></path>
  </svg>
);

const SvgFinanceBilling = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h10V8.414L12.586 5A2 2 0 0012 4.414V4H6zm0 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
  </svg>
);

const SvgProjectsTasks = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const SvgAssetsDocuments = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </svg>
);


export const initialPermissionsStructure = {
  "Dashboard": {
    icon: <SvgDashboard />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
  "Users": {
    icon: <SvgUsers />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
  "Attendance": {
    icon: <SvgAttendance />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
  "Finance & Billing": {
    icon: <SvgFinanceBilling />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
  "Projects & Tasks": {
    icon: <SvgProjectsTasks />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
  "Assets & Documents": {
    icon: <SvgAssetsDocuments />,
    actions: { View: false, Create: false, Edit: false, Delete: false, Manage: false },
  },
};

export const parsePermissionName = (permissionName) => {
  let module = 'Unknown';
  let action = 'Unknown';

  const cleanName = permissionName.replace(/^Can /, '').toLowerCase();

  // Map actions
  if (cleanName.startsWith('view ')) action = 'View';
  else if (cleanName.startsWith('add ')) action = 'Create';
  else if (cleanName.startsWith('change ')) action = 'Edit';
  else if (cleanName.startsWith('delete ')) action = 'Delete';
  else if (cleanName.includes('manage')) action = 'Manage'; // Heuristic for 'Manage'

  // Map modules - heuristic based on common words in the permission name
  if (cleanName.includes('dashboard')) module = 'Dashboard';
  else if (cleanName.includes('user') || cleanName.includes('employee')) module = 'Users';
  else if (cleanName.includes('attendance')) module = 'Attendance';
  else if (cleanName.includes('finance') || cleanName.includes('billing') || cleanName.includes('payroll')) module = 'Finance & Billing';
  else if (cleanName.includes('project') || cleanName.includes('task')) module = 'Projects & Tasks';
  else if (cleanName.includes('asset') || cleanName.includes('document')) module = 'Assets & Documents';

  return { module, action };
};
