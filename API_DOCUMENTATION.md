# API Documentation for Frontend Integration

This document provides a detailed overview of the backend API endpoints and their data structures, intended to guide frontend developers in integrating with the CRM StudioOps API.

## `HR_Payroll` App

This app manages users, roles, permissions, and payroll. The base URL for this app is `/api/users/`.

### Endpoints and Serializers

- **`/api/users/register/`**: `RegisterView`
  - **Purpose**: User registration.
- **`/api/users/login/`**: `LoginView`
  - **Purpose**: User authentication.
- **`/api/users/users/`**: `UserViewSet` with `UserSerializer`
  - **Purpose**: CRUD operations for users.
  - **Fields**: `id`, `email`, `name`, `phone`, `is_active`, `is_staff`, `groups`, `user_permissions`, `created_by`, `created_at`
- **`/api/users/employees/`**: `EmployeeViewSet` with `EmployeeSerializer`
  - **Purpose**: CRUD operations for employees.
  - **Fields**: All fields from the `Employee` model, with nested `UserSerializer` data.
- **`/api/users/departments/`**: `DepartmentViewSet` with `DepartmentSerializer`
  - **Purpose**: CRUD operations for departments.
  - **Fields**: All fields from the `Department` model.
- **`/api/users/modules/`**: `ModuleViewSet` with `ModuleSerializer`
  - **Purpose**: CRUD operations for modules.
  - **Fields**: All fields from the `Module` model.
- **`/api/users/permissions/`**: `PermissionViewSet` with `PermissionSerializer`
  - **Purpose**: CRUD operations for permissions.
  - **Fields**: `id`, `codename`, `name`
- **`/api/users/roles/`**: `RoleViewSet` with `GroupSerializer`
  - **Purpose**: CRUD operations for roles (groups).
  - **Fields**: `id`, `name`, `permissions`
- **`/api/users/audit-logs/`**: `AuditLogViewSet` with `AuditLogSerializer`
  - **Purpose**: Viewing audit logs.
  - **Fields**: All fields from the `AuditLog` model.
- **`/api/users/attendance/`**: `AttendanceViewSet` with `AttendanceSerializer`
  - **Purpose**: Managing attendance.
  - **Fields**: All fields from the `Attendance` model.
- **`/api/users/salary-structures/`**: `SalaryStructureViewSet` with `SalaryStructureSerializer`
  - **Purpose**: Managing salary structures.
  - **Fields**: All fields from the `SalaryStructure` model.
- **`/api/users/payroll/`**: `PayrollViewSet` with `PayrollSerializer`
  - **Purpose**: Managing payroll.
  - **Fields**: All fields from the `Payroll` model.

## `Sales` App

This app manages clients, leads, and enquiries. The base URL for this app is `/api/`.

### Endpoints and Serializers

- **`/api/clients/`**: `ClientViewSet` with `ClientSerializer`.
  - **Purpose**: CRUD operations for clients.
  - **Fields**: All fields from the `Client` model are exposed. Refer to `backend/Sales/models.py` for the `Client` model definition.
- **`/api/lead/`**: `LeadViewSet` with `LeadSerializer`.
  - **Purpose**: CRUD operations for leads.
  - **Fields**: All fields from the `Lead` model are exposed. Refer to `backend/Sales/models.py` for the `Lead` model definition.
- **`/api/enquiry/`**: `EnquiryViewSet` with `EnquirySerializer`.
  - **Purpose**: CRUD operations for enquiries.
  - **Fields**: All fields from the `Enquiry` model are exposed. Refer to `backend/Sales/models.py` for the `Enquiry` model definition.

## `project` App

This app manages projects, tasks, assets, and client reviews. It provides both internal and client-facing APIs.

### Internal APIs

- **`/api/projects/`**: `ProjectViewSet` with `ProjectSerializer`
  - **Purpose**: CRUD for Projects.
  - **Fields**: All fields from the `Project` model. See `backend/project/models.py`.
- **`/api/stage-elements/`**: `ProjectStageElementViewSet` with `ProjectStageElementDetailSerializer`
  - **Purpose**: Manage stage elements (tasks).
  - **Fields**: `id`, `stage`, `template`, `order`, `contribution_percentage`, `estimated_hours`, `actual_hours`, `status`, `rejection_notes`, `project_name`, `template_name`, `versions`, `assets`, `assignments`.
- **`/api/assets/`**: `ProjectAssetViewSet` with `ProjectAssetSerializer`
  - **Purpose**: Internal asset management.
  - **Fields**: All fields from the `ProjectAsset` model. See `backend/project/models.py`.
- **`/api/versions/`**: `StageElementVersionViewSet` with `StageElementVersionSerializer`
  - **Purpose**: Revision history for stage elements.
  - **Fields**: All fields from the `StageElementVersion` model. See `backend/project/models.py`.
- **`/api/time-logs/`**: `ProjectTimeLogViewSet` with `ProjectTimeLogSerializer`
  - **Purpose**: Track time spent per task.
  - **Fields**: All fields from the `ProjectTimeLog` model. See `backend/project/models.py`.

### Client APIs

- **`/api/client/assets/`**: `ClientProjectAssetViewSet` with `ClientProjectAssetSerializer`
  - **Purpose**: Client view of approved project assets.
  - **Fields**: `id`, `asset_role`, `file`, `version_number`, `description`, `created_at`.
- **`/api/client/stage-elements/`**: `ClientProjectStageElementViewSet` with `ClientProjectStageElementSerializer`
  - **Purpose**: Client view of stage elements/tasks.
  - **Fields**: `id`, `status`, `rejection_notes`, `assets`.
- **`/api/client/reviews/`**: `ClientReviewLogViewSet` with `ClientReviewLogSerializer`
  - **Purpose**: Client logs for approvals/rejections.
  - **Fields**: All fields from the `ClientReviewLog` model. See `backend/project/models.py`.
- **`/api/client/assets/<int:asset_id>/stream/`**: `AssetStreamView`
  - **Purpose**: Securely stream asset content.

## `finance` App

This app handles invoicing. The base URL for this app is `/api/finance/`.

### Endpoints and Serializers

- **`/api/finance/invoices/`**: `InvoiceViewSet` with `InvoiceSerializer`.
  - **Purpose**: CRUD operations for invoices.
  - **Fields**: All fields from the `Invoice` model, with a nested list of `items`. Refer to `backend/finance/models.py` for the `Invoice` model definition.
- **`/api/finance/invoice-items/`**: `InvoiceItemViewSet` with `InvoiceItemSerializer`.
  - **Purpose**: CRUD operations for invoice items.
  - **Fields**: All fields from the `InvoiceItem` model are exposed. Refer to `backend/finance/models.py` for the `InvoiceItem` model definition.
