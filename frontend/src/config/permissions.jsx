import React from 'react';
import { 
  BarChart3, Users, Clock, CreditCard, 
  Layers, FolderOpen, ShoppingCart, MessageSquare, 
  Settings, Zap, Shield, FileText 
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

export const initialPermissionsStructure = {
  "Dashboard & Analytics": {
    icon: <BarChart3 className="h-5 w-5" />,
    visual: ["view_dashboard", "view_reports"],
    executional: ["manage_analytics"]
  },
  "Sales & Pipeline": {
    icon: <ShoppingCart className="h-5 w-5" />,
    visual: ["view_enquiry", "view_lead", "view_quotation"],
    executional: ["add_enquiry", "change_enquiry", "add_lead", "change_lead", "add_quotation", "change_quotation", "delete_lead"]
  },
  "Production Workflow": {
    icon: <Layers className="h-5 w-5" />,
    visual: ["view_project", "view_projectstage", "view_projectstageelement", "view_projectasset"],
    executional: [
      "add_project", "change_project", 
      "add_projectstage", "change_projectstage", 
      "add_projectstageelement", "change_projectstageelement",
      "add_projectasset", "change_projectasset", "delete_projectasset",
      "add_taskcomment", "manage_project_assignments"
    ]
  },
  "Finance & Billing": {
    icon: <CreditCard className="h-5 w-5" />,
    visual: ["view_invoice", "view_payment", "view_payroll"],
    executional: ["add_invoice", "change_invoice", "add_payment", "add_payroll", "generate_payroll"]
  },
  "Team & HR": {
    icon: <Users className="h-5 w-5" />,
    visual: ["view_user", "view_employee", "view_empattendance"],
    executional: ["add_user", "change_user", "add_employee", "change_employee", "add_empattendance", "change_empattendance"]
  },
  "Master Data & Settings": {
    icon: <Settings className="h-5 w-5" />,
    visual: ["view_folderstructuretemplate", "view_projectstagetemplate", "view_permission"],
    executional: [
      "add_folderstructuretemplate", "change_folderstructuretemplate", 
      "add_projectstagetemplate", "change_projectstagetemplate",
      "manage_storage_settings", "add_group", "change_group", "delete_group"
    ]
  },
};

export const parsePermissionName = (perm) => {
  const codename = perm.codename || '';
  const name = perm.name || '';
  
  let type = 'executional';
  if (codename.startsWith('view_')) {
    type = 'visual';
  }

  // Find which group this permission belongs to
  let group = "Other";
  for (const [groupName, config] of Object.entries(initialPermissionsStructure)) {
    if (config.visual.includes(codename) || config.executional.includes(codename)) {
      group = groupName;
      break;
    }
  }

  // If still unknown, try heuristic based on codename
  if (group === "Other") {
    if (codename.includes('project') || codename.includes('task') || codename.includes('stage') || codename.includes('asset')) group = "Production Workflow";
    else if (codename.includes('enquiry') || codename.includes('lead') || codename.includes('quotation')) group = "Sales & Pipeline";
    else if (codename.includes('invoice') || codename.includes('payment') || codename.includes('payroll')) group = "Finance & Billing";
    else if (codename.includes('user') || codename.includes('employee') || codename.includes('attendance')) group = "Team & HR";
    else if (codename.includes('template') || codename.includes('setting') || codename.includes('group') || codename.includes('permission')) group = "Master Data & Settings";
  }

  // Simplify action name for the UI
  let action = codename.split('_')[0]; 
  action = action.charAt(0).toUpperCase() + action.slice(1);

  return { group, type, action, codename, name };
};
