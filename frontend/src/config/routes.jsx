// src/config/routes.js
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

import ServiceList from '../features/services/pages/ServiceList';
import ServiceForm from '../features/services/components/ServiceForm';

import Layout from '../shared/components/Layout';
import PrivateRoute from '../shared/components/PrivateRoute';


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
                    { path: '/dashboard', element: <Dashboard /> },
                    { path: '/tasks', element: <TaskPage /> },
                    { path: '/tasks/:taskId', element: <TaskDetails /> },
                    { path: '/projects', element: <Projects /> },
                    { path: '/projects/:id', element: <ProjectDetails /> },
                    { path: '/projects/:id/version-history', element: <VersionHistory /> },
                    { path: '/projects/reassign-user', element: <ReassignProject /> },
                    { path: '/projects/status', element: <ProjectStatus /> },
                    { path: '/calendar', element: <Calendar /> },
                    { path: '/users', element: <UserManagement /> },
                    { path: '/users/:id', element: <UserProfile /> },
                    {
                        path: '/settings', element: <Settings />,
                        children: [
                            { index: true, element: <StorageSettings /> }, // Default sub-route
                            { path: 'storage', element: <StorageSettings /> },
                            { path: 'folder-templates', element: <FolderStructureTemplateManagement /> },
                        ]
                    },
                    { path: '/clients', element: <ClientManagement /> },
                    { path: '/rework-requests', element: <ReworkRequests /> },
                    { path: '/rework-requests/:id', element: <ReworkRequestDetails /> },
                    { path: '/permissions', element: <Permissions /> },
                    { path: '/roles/create', element: <CreateRole /> },
                    { path: '/projects/create', element: <CreateNewProject /> },
                    { path: '/invoice', element: <InvoicePage /> },
                    { path: '/invoice/create', element: <CreateInvoiceForm /> },
                    { path: '/invoice/:invoiceId', element: <InvoiceDetails /> },
                    { path: '/packages', element: <PackageManagement /> },
                    { path: '/reports', element: <ReportAndAnalysis /> },
                    { path: '/leads', element: <LeadManagement /> },
                    { path: '/enquiries', element: <EnquiryManagement /> },
                    { path: '/master/packages', element: <PackageManagement /> },
                    { path: '/master/packages/:packageId/items', element: <PackageItemPage /> },
                    { path: '/master/workflow-templates', element: <WorkflowTemplateManagement /> },
                    { path: '/master/folder-structures', element: <FolderStructureTemplateList /> },
                    { path: '/services', element: <ServiceList /> },
                    { path: '/services/new', element: <ServiceForm /> },
                    { path: '/services/edit/:id', element: <ServiceForm /> },
                    { path: '/project-stage-element-templates', element: <ProjectStageElementTemplateManagementPage /> },
                ],
            },
        ],
    },
];

