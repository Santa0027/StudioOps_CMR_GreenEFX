import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/login/SignupPage'; // Import SignupPage
import ForgotPasswordPage from './components/login/ForgotPasswordPage'; // Import ForgotPasswordPage
import Dashboard from './components/Dashboard';
import Projects from './page/Projects';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import ClientManagement from './page/ClientManagement';
import UserManagement from './components/UserManagement'; // Import UserManagement
import ProjectDetails from './page/ProjectDetails'; // Import ProjectDetails
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import Layout from './components/Layout'; // Import Layout
import VersionHistory from './components/VersionHistory'; // Import VersionHistory
import TaskPage from './page/TaskPage'; // Import TaskPage
import TaskDetails from './page/TaskDetails'; // Import TaskDetails
import ReworkRequests from './components/ReworkRequests'; // Import ReworkRequests
import ReworkRequestDetails from './components/ReworkRequestDetails'; // Import ReworkRequestDetails
import Permissions from './components/Permissions';
import Attendance from './components/Attendance';
import MonthlyAttendanceCalendar from './components/MonthlyAttendanceCalendar';
import CreateRole from './components/CreateRole';
import UserProfile from './components/UserProfile';
import CreateNewProject from './components/CreateNewProject';
import ReassignProject from './components/ReassignProject'; // Import ReassignProject
import ProjectStatus from './components/ProjectStatus'; // Import ProjectStatus
import InvoicePage from './components/InvoicePage'; // Import InvoicePage for listing
import InvoiceDetails from './components/InvoiceDetails'; // Import InvoiceDetails for single invoice view
import CreateInvoiceForm from './components/CreateInvoiceForm'; // Import CreateInvoiceForm
import PackageManagement from './page/PackageManagement'; // Import PackageManagement
import PackageItemPage from './page/PackageItemPage'; // Import PackageItemPage
import ProjectStageElementTemplateManagementPage from './page/ProjectStageElementTemplateManagementPage'; // Import ProjectStageElementTemplateManagementPage
import ReportAndAnalysis from './components/ReportAndAnalysis'; // Import ReportAndAnalysis
import LeadManagement from './page/LeadManagement'; // Import LeadManagement
import EnquiryManagement from './page/EnquiryManagement'; // Import EnquiryManagement
import ServiceList from './components/service/ServiceList'; // Import ServiceList
import ServiceForm from './components/service/ServiceForm'; // Import ServiceForm
import WorkflowTemplateManagement from './page/WorkflowTemplateManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/version-history" element={<VersionHistory />} />
          <Route path="/projects/reassign-user" element={<ReassignProject />} />
          <Route path="/projects/status" element={<ProjectStatus />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/rework-requests" element={<ReworkRequests />} />
          <Route path="/rework-requests/:id" element={<ReworkRequestDetails />} />
          <Route path="/permissions" element={<Permissions />} />
          {/* Removed attendance routes as they are now integrated into UserManagement */}
          <Route path="/roles/create" element={<CreateRole />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/projects/create" element={<CreateNewProject />} />
          <Route path="/invoice" element={<InvoicePage />} /> {/* List all invoices */}
          <Route path="/invoice/create" element={<CreateInvoiceForm />} /> {/* Create new invoice */}
          <Route path="/invoice/:invoiceId" element={<InvoiceDetails />} /> {/* View specific invoice details */}
          <Route path="/packages" element={<PackageManagement />} /> {/* Manage work packages */}
          <Route path="/reports" element={<ReportAndAnalysis />} /> {/* Reports and Analysis page */}
          <Route path="/leads" element={<LeadManagement />} />
          <Route path="/enquiries" element={<EnquiryManagement />} />

          {/* Master Modules */}
          <Route path="/master/packages" element={<PackageManagement />} /> {/* Master module: Package Management */}
          <Route path="/master/packages/:packageId/items" element={<PackageItemPage />} />
          <Route path="/master/workflow-templates" element={<WorkflowTemplateManagement />} /> {/* New consolidated Workflow Template Management */}
          <Route path="/services" element={<ServiceList />} /> {/* Master module: Service Management */}
          <Route path="/services/new" element={<ServiceForm />} />
          <Route path="/services/edit/:id" element={<ServiceForm />} />
          {/* Removed old ProjectStageTemplateManagement and ProjectStageElementTemplateManagementPage routes */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;