# CRM StudioOps - Feature Documentation

CRM StudioOps is a comprehensive studio management system designed to automate the lifecycle of creative production, from initial sales enquiry to final asset delivery.

---

## 1. Sales & Lead Management
*   **Enquiry Management:** Track initial client interests and service requests.
*   **Lead Management:** Convert enquiries into leads and manage potential opportunities.
*   **Automated Project Conversion:** Leads marked as "Won" automatically trigger project creation based on accepted quotations.
*   **Quotation System:** Generate detailed quotations with line items linked to studio services and packages.

## 2. Project Management
*   **Project Tracking:** Centralized dashboard for monitoring all active, completed, and pending projects.
*   **Progress Monitoring:** Real-time calculation of project and stage progress based on task completion.
*   **Stage-Based Workflow:** Projects are organized into sequential stages (e.g., Pre-production, Production, Post-production).
*   **Automated Stage Progression:** Completing all tasks in a stage automatically activates the next stage in the sequence.

## 3. Task Management & Lifecycle
*   **Intelligent Task Assignment:** Assign tasks to team members with specific roles and instructions (Initial Notes).
*   **Task Lifecycle Guardrails:** Strict status transitions (Pending → In Progress → Waiting Review → Waiting Client Review → Completed).
*   **Time Tracking:** Built-in timer for members to track actual hours spent on specific tasks.
*   **Status Clarifications:** Mandatory notes required for "Hold" or "Block" actions to ensure team alignment.
*   **Input/Output Linking:** Tasks automatically pull assets from the preceding task as "Input Work," ensuring seamless continuity.

## 4. Quality Control & Approvals
*   **Manager Review Loop:** Integrated "Request Review" action that requires at least one uploaded asset.
*   **Manager Approval/Rework:** Managers can approve work or send it back for rework with detailed instructions.
*   **Client Review Portal:** Securely stage approved assets for external client feedback.
*   **Client Sign-off:** Clients can approve tasks or request adjustments directly through the system.
*   **Lifecycle Locking:** Completed tasks are frozen to prevent unauthorized modifications.

## 5. Asset & Storage Management
*   **Hybrid Storage Support:** Support for Local Storage, NAS (Network Attached Storage), and AWS S3 Cloud Storage.
*   **NAS Folder Automation:** Automatically generates standardized project folder structures on the NAS upon project creation.
*   **Asset Categorization:** Upload files with specific types (Image, Video, PSD, etc.) and roles (Source, Preview, Final).
*   **Storage Health Checks:** Built-in "Test Connection" tools for NAS and S3 to ensure infrastructure reliability.

## 6. HR & User Management
*   **User Directory:** Manage employee profiles and contact information.
*   **Role-Based Access Control (RBAC):** Granular permissions and roles (Admin, Manager, Internal User, Client).
*   **Attendance Tracking:** Log employee attendance and manage monthly calendars.
*   **Payroll Management:** System for generating payroll and managing salary structures.

## 7. Finance & Billing
*   **Package Management:** Define standardized service packages with specific items and quantities.
*   **Invoice Generation:** Create professional invoices linked to project milestones and deliverables.

## 8. Master Configuration (Templates)
*   **Workflow Templates:** Pre-define stages and tasks for different types of studio services.
*   **Folder Structure Templates:** Define standardized directory trees for NAS automation.
*   **Service Management:** Manage the catalog of services offered by the studio.

---
*Last Updated: February 21, 2026*
