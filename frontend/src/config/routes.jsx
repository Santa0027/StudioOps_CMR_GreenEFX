// src/config/routes.jsx
import React from 'react';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';

import Dashboard from '../app/components/Dashboard';
import Settings from '../app/components/Settings';
import StorageSettings from '../app/components/settings/StorageSettings';
import Calendar from '../app/components/Calendar';

import Projects from '../features/projects/pages/Projects';
import ProjectDetails from '../features/projects/pages/ProjectDetails';
import VersionHistory from '../features/projects/components/VersionHistory';
import ReassignProject from '../features/projects/components/ReassignProject';
import ProjectStatus from '../features/projects/components/ProjectStatus';
import CreateNewProject from '../features/projects/components/CreateNewProject';
import ProjectStageElementTemplateManagementPage from '../features/projects/pages/ProjectStageElementTemplateManagementPage';
import WorkflowTemplateManagement from '../features/projects/pages/WorkflowTemplateManagement';
import FolderStructureTemplateList from '../features/projects/components/FolderStructureTemplateList';
import FolderStructureTemplateManagement from '../features/projects/components/FolderStructureTemplateManagement';

import TaskPage from '../features/tasks/pages/TaskPage';
import TaskDetails from '../features/tasks/pages/TaskDetails';

import UserManagement from '../features/users/pages/UserManagement';
import UserProfile from '../features/users/pages/UserProfile';

import ClientManagement from '../features/clients/pages/ClientManagement';

import AssetLibrary from '../features/assets/pages/AssetLibrary';

import ReworkRequests from '../features/rework/pages/ReworkRequests';
import ReworkRequestDetails from '../features/rework/pages/ReworkRequestDetails';

import Permissions from '../features/hr/components/Permissions';
import Attendance from '../features/hr/components/Attendance';
import MonthlyAttendanceCalendar from '../features/hr/components/MonthlyAttendanceCalendar';
import CreateRole from '../features/hr/components/CreateRole';

import InvoicePage from '../features/finance/pages/InvoicePage';
import InvoiceDetails from '../features/finance/pages/InvoiceDetails';
import CreateInvoiceForm from '../features/finance/components/CreateInvoiceForm';

import PackageManagement from '../features/packages/pages/PackageManagement';
import PackageItemPage from '../features/packages/pages/PackageItemPage';

import ReportAndAnalysis from '../features/reports/pages/ReportAndAnalysis';

import LeadManagement from '../features/sales/pages/LeadManagement';
import EnquiryManagement from '../features/sales/pages/EnquiryManagement';

import ServiceManagement from '../features/services/pages/ServiceManagement';

import Layout from '../shared/components/Layout';
import PrivateRoute from '../shared/components/PrivateRoute';
import RoleBasedRoute from '../shared/components/RoleBasedRoute';


export const publicRoutes = [
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
];

export const protectedRoutes = [
    {
        element: <PrivateRoute />,
        children: [
            {
                element: <Layout />,
                children: [
                    // --- Level: Any Authenticated User ---
                    { path: '/dashboard', element: <Dashboard /> },
                    { path: '/tasks', element: <TaskPage /> },
                    { path: '/tasks/:taskId', element: <TaskDetails /> },
                    { path: '/projects', element: <Projects /> },
                    { path: '/projects/:id', element: <ProjectDetails /> },
                    { path: '/projects/:id/version-history', element: <VersionHistory /> },
                    { path: '/calendar', element: <Calendar /> },
                    { path: '/users', element: <UserManagement /> }, // Attendance entry is inside here
                    { path: '/users/:id', element: <UserProfile /> },
                    { path: '/profile', element: <UserProfile /> },
                    { path: '/asset-library', element: <AssetLibrary /> },
                    
                    // --- Level: Manager & Above ---
                    {
                        element: <RoleBasedRoute level="manager" />,
                        children: [
                            { path: '/enquiries', element: <EnquiryManagement /> },
                            { path: '/leads', element: <LeadManagement /> },
                            { path: '/clients', element: <ClientManagement /> },
                            { path: '/rework-requests', element: <ReworkRequests /> },
                            { path: '/rework-requests/:id', element: <ReworkRequestDetails /> },
                            { path: '/projects/create', element: <CreateNewProject /> },
                            { path: '/projects/reassign-user', element: <ReassignProject /> },
                            { path: '/projects/status', element: <ProjectStatus /> },
                            { path: '/invoice', element: <InvoicePage /> },
                            { path: '/invoice/create', element: <CreateInvoiceForm /> },
                            { path: '/invoice/:invoiceId', element: <InvoiceDetails /> },
                            { path: '/reports', element: <ReportAndAnalysis /> },
                            {
                                path: '/settings', element: <Settings />,
                                children: [
                                    { index: true, element: <StorageSettings /> },
                                    { path: 'storage', element: <StorageSettings /> },
                                    { path: 'folder-templates', element: <FolderStructureTemplateManagement /> },
                                ]
                            },
                        ]
                    },

                    // --- Level: Admin Only ---
                    {
                        element: <RoleBasedRoute level="admin" />,
                        children: [
                            { path: '/permissions', element: <Permissions /> },
                            { path: '/roles/create', element: <CreateRole /> },
                            { path: '/services', element: <ServiceManagement /> },
                            { path: '/master/packages', element: <PackageManagement /> },
                            { path: '/master/packages/:packageId/items', element: <PackageItemPage /> },
                            { path: '/master/workflow-templates', element: <WorkflowTemplateManagement /> },
                            { path: '/master/folder-structures', element: <FolderStructureTemplateList /> },
                            { path: '/project-stage-element-templates', element: <ProjectStageElementTemplateManagementPage /> },
                        ]
                    },
                ],
            },
        ],
    },
];
