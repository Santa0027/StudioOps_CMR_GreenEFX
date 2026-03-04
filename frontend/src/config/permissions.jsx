import React from 'react';
import { 
  BarChart3, Users, Clock, CreditCard, 
  Layers, FolderOpen, ShoppingCart, MessageSquare, 
  Settings, Zap, Shield, FileText, Globe
} from 'lucide-react';

// SVG Icon Components Mapping to project lifecycle
export const permissionGroupIcons = {
  "Sales & Pipeline": <ShoppingCart className="h-5 w-5" />,
  "Production Workflow": <Layers className="h-5 w-5" />,
  "Finance & Billing": <CreditCard className="h-5 w-5" />,
  "Team & HR": <Users className="h-5 w-5" />,
  "Master Data & Settings": <Settings className="h-5 w-5" />,
  "Dashboard & Analytics": <BarChart3 className="h-5 w-5" />,
};

// Simplified structure: Module -> List of Models
export const initialPermissionsStructure = {
  "Dashboard & Analytics": {
    icon: <BarChart3 className="h-5 w-5" />,
    models: [
      { name: "Dashboard", codename: "dashboard", app: "hr_payroll" },
      { name: "System Logs", codename: "auditlog", app: "hr_payroll" },
      { name: "Version Logs", codename: "versionauditlog", app: "project" }
    ]
  },
  "Sales & Pipeline": {
    icon: <ShoppingCart className="h-5 w-5" />,
    models: [
      { name: "Enquiries", codename: "enquiry", app: "Sales" },
      { name: "Leads", codename: "lead", app: "Sales" },
      { name: "Quotations", codename: "quotation", app: "Sales" },
      { name: "Clients", codename: "clients", app: "Sales" }
    ]
  },
  "Production Workflow": {
    icon: <Layers className="h-5 w-5" />,
    models: [
      { name: "Projects", codename: "project", app: "project" },
      { name: "Project Stages", codename: "projectstage", app: "project" },
      { name: "Tasks (Elements)", codename: "projectstageelement", app: "project" },
      { name: "Work Assets", codename: "projectasset", app: "project" },
      { name: "Task Comments", codename: "taskcomment", app: "project" }
    ]
  },
  "Finance & Billing": {
    icon: <CreditCard className="h-5 w-5" />,
    models: [
      { name: "Invoices", codename: "invoice", app: "finance" },
      { name: "Payments", codename: "payment", app: "finance" },
      { name: "Payroll", codename: "payroll", app: "hr_payroll" },
      { name: "Salary Structures", codename: "salarystructure", app: "hr_payroll" },
      { name: "Payslips", codename: "payslip", app: "hr_payroll" }
    ]
  },
  "Team & HR": {
    icon: <Users className="h-5 w-5" />,
    models: [
      { name: "User Accounts", codename: "user", app: "hr_payroll" },
      { name: "Employee Profiles", codename: "employee", app: "hr_payroll" },
      { name: "Attendance Logs", codename: "empattendance", app: "hr_payroll" },
      { name: "Departments", codename: "departmentofstaff", app: "hr_payroll" },
      { name: "Leave Requests", codename: "leaverequest", app: "hr_payroll" }
    ]
  },
  "Master Data & Settings": {
    icon: <Settings className="h-5 w-5" />,
    models: [
      { name: "Folder Templates", codename: "folderstructuretemplate", app: "project" },
      { name: "Workflow Templates", codename: "projectstagetemplate", app: "project" },
      { name: "Global Roles", codename: "group", app: "auth" },
      { name: "System Permissions", codename: "permission", app: "auth" },
      { name: "Storage Settings", codename: "storagesetting", app: "project" }
    ]
  },
};

export const parsePermissionName = (perm) => {
  const codename = perm.codename || '';
  const name = perm.name || '';
  
  // Standard Django actions
  let action = 'Other';
  if (codename.startsWith('view_')) action = 'View';
  else if (codename.startsWith('add_')) action = 'Create';
  else if (codename.startsWith('change_')) action = 'Edit';
  else if (codename.startsWith('delete_')) action = 'Delete';

  // Find model mapping
  let modelInfo = null;
  for (const group of Object.values(initialPermissionsStructure)) {
    const found = group.models.find(m => codename.endsWith(`_${m.codename}`));
    if (found) {
      modelInfo = found;
      break;
    }
  }

  return { 
    group: modelInfo ? modelInfo.name : 'System', 
    action, 
    codename, 
    name 
  };
};
