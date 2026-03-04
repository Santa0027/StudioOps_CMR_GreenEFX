import api from "./axios";

// READ

export const getUsers = () => api.get("/users/users/"); // Updated endpoint
export const getUser = (id) => api.get(`/users/users/${id}/`);
export const createUser = (data) => api.post("/users/users/", data);
export const updateUser = (id, data) => api.put(`/users/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/users/users/${id}/`);

export const getEmployees = () => api.get("/users/employees/");

// Role APIs
export const getRoles = () => api.get("/users/roles/");
export const getRole = (id) => api.get(`/users/roles/${id}/`);
export const createRole = (data) => api.post("/users/roles/", data);
export const updateRole = (id, data) => api.patch(`/users/roles/${id}/`, data);
export const deleteRole = (id) => api.delete(`/users/roles/${id}/`);

// Permission APIs
export const getPermissions = () => api.get("/users/permissions/");

// Attendance APIs
export const getAttendances = (params) => api.get("/users/attendance/", { params });
export const createAttendance = (data) => api.post("/users/attendance/", data);
export const updateAttendance = (id, data) => api.put(`/users/attendance/${id}/`, data);
export const deleteAttendance = (id) => api.delete(`/users/attendance/${id}/`);
export const checkIn = () => api.post("/users/attendance/check-in/");
export const checkOut = () => api.post("/users/attendance/check-out/");


//---------------------------------------------  Enquiry apis --------------------------------

export const getEnquiries = () => api.get("/enquiry/");
//create
export const createEnquiry = (data) => api.post("/enquiry/", data);
// update
export const updateEnquiry = (id, data) => api.put(`/enquiry/${id}/`, data);
// delete
export const deleteEnquiry = (id) => api.delete(`/enquiry/${id}/`);

// ---------------------------------------------- end enquiry-----------------------------------



// ----------------------------------------------Lead apis -------------------------------------


export const getleads = () => api.get("/lead/")
// create
export const createlead = (data) => api.post("/lead/", data);
// UPDATE
export const updatelead = (id, data) => api.put(`/lead/${id}/`, data);
// DELETE
export const deletelead = (id) => api.delete(`/lead/${id}/`);


// ---------------------------------------------end leads ---------------------------------------


// ----------------------------------------------FollowUp apis -------------------------------------

export const getFollowUps = () => api.get("/followup/");
export const createFollowUp = (data) => api.post("/followup/", data);
export const updateFollowUp = (id, data) => api.put(`/followup/${id}/`, data);
export const deleteFollowUp = (id) => api.delete(`/followup/${id}/`);

// ---------------------------------------------end FollowUp ---------------------------------------


// ----------------------------------------------LeadFollowUp apis -------------------------------------

export const getLeadFollowUps = () => api.get("/leadfollowup/");
export const createLeadFollowUp = (data) => api.post("/leadfollowup/", data);
export const updateLeadFollowUp = (id, data) => api.put(`/leadfollowup/${id}/`, data);
export const deleteLeadFollowUp = (id) => api.delete(`/leadfollowup/${id}/`);

// ---------------------------------------------end LeadFollowUp ---------------------------------------


// ---------------------------------------------- Client APIs -------------------------------------

export const getClients = () => api.get("/clients/");
export const createClient = (data) => api.post("/clients/", data);
export const updateClient = (id, data) => api.put(`/clients/${id}/`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}/`);

// --------------------------------------------- end Client APIs -----------------------------------


// ---------------------------------------------- Project APIs -------------------------------------

export const getProjects = () => api.get("/projects/");
export const getProject = (id) => api.get(`/projects/${id}/`);
export const createProject = (data) => api.post("/projects/", data);
export const updateProject = (id, data) => api.patch(`/projects/${id}/`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}/`);
export const getProjectVersions = (projectId) => api.get(`/projects/${projectId}/versions/`);
export const uploadProjectVersion = (projectId, data) => api.post(`/projects/${projectId}/upload-version/`, data);

// --------------------------------------------- end Project APIs -----------------------------------
// ---------------------------------------------- Task Assignment APIs --------------------------------
export const createTaskAssignment = (taskId, assignmentData) => api.post(`/stage-elements/${taskId}/assignments/`, assignmentData);
// --------------------------------------------- end Task Assignment APIs -----------------------------

// ---------------------------------------------- Project Stage Element APIs (Tasks) -----------------
export const getProjectStageElements = (projectId) => api.get(`/stage-elements/`, { params: { project_id: projectId } });
export const getProjectStageElement = (id) => api.get(`/stage-elements/${id}/`);
export const createProjectStageElement = (data) => api.post("/stage-elements/", data);
export const updateProjectStageElement = (id, data) => api.patch(`/stage-elements/${id}/`, data); // Changed to patch
export const deleteProjectStageElement = (id) => api.delete(`/stage-elements/${id}/`);

// New actions for manager and client approval workflows
export const requestManagerApproval = (taskId) => api.post(`/stage-elements/${taskId}/request_manager_approval/`);
export const approveManagerReview = (taskId) => api.post(`/stage-elements/${taskId}/approve_manager_review/`);
export const rejectManagerReview = (taskId, reworkNotes) => api.post(`/stage-elements/${taskId}/reject_manager_review/`, { rework_notes: reworkNotes });
export const stageForClientReview = (taskId) => api.post(`/stage-elements/${taskId}/stage_for_client_review/`);
export const clientApprove = (taskId) => api.post(`/stage-elements/${taskId}/client_approve/`);
export const clientReject = (taskId, reworkNotes) => api.post(`/stage-elements/${taskId}/client_reject/`, { rework_notes: reworkNotes });

// --------------------------------------------- end Project Stage Element APIs --------------------

// ---------------------------------------------- Package APIs -------------------------------------

export const getPackages = () => api.get("/packages/");
export const getPackage = (packageId) => api.get(`/packages/${packageId}/`);
export const createPackage = (data) => api.post("/packages/", data);
export const updatePackage = (id, data) => api.put(`/packages/${id}/`, data);
export const deletePackage = (id) => api.delete(`/packages/${id}/`);

// --------------------------------------------- end Package APIs -----------------------------------

// ---------------------------------------------- PackageItem APIs (Nested under Package) -----------

export const getPackageItemsForPackage = (packageId) => api.get(`/packages/${packageId}/items/`);
export const createPackageItemForPackage = (packageId, data) => api.post(`/packages/${packageId}/items/`, data);
export const updatePackageItem = (packageId, itemId, data) => api.put(`/packages/${packageId}/items/${itemId}/`, data);
export const deletePackageItem = (packageId, itemId) => api.delete(`/packages/${packageId}/items/${itemId}/`);

// --------------------------------------------- end PackageItem APIs -------------------------------

// ---------------------------------------------- Project Stage Template APIs -------------------------

export const getProjectStageTemplates = () => api.get("/stage-templates/");
export const createProjectStageTemplate = (data) => api.post("/stage-templates/", data);
export const updateProjectStageTemplate = (id, data) => api.put(`/stage-templates/${id}/`, data);
export const deleteProjectStageTemplate = (id) => api.delete(`/stage-templates/${id}/`);

// --------------------------------------------- end Project Stage Template APIs --------------------

// ---------------------------------------------- Project Stage Element Template APIs -----------------

export const getProjectStageElementTemplatesForStage = (stageId) => api.get(`/stage-templates/${stageId}/elements/`);
export const createProjectStageElementTemplateForStage = (stageId, data) => api.post(`/stage-templates/${stageId}/elements/`, data);
export const updateProjectStageElementTemplate = (stageId, elementId, data) => api.put(`/stage-templates/${stageId}/elements/${elementId}/`, data);
export const deleteProjectStageElementTemplate = (stageId, elementId) => api.delete(`/stage-templates/${stageId}/elements/${elementId}/`);

// ---------------------------------------------- Stage Element Version APIs -------------------------
export const createStageElementVersion = (elementId, versionData) => api.post(`/stage-elements/${elementId}/versions/`, versionData);
// --------------------------------------------- end Stage Element Version APIs --------------------

// ---------------------------------------------- Asset Upload APIs -------------------------
export const getAssets = (params) => api.get("/assets/", { params });
export const uploadAssetForStageElement = (elementId, formData) => api.post(`/stage-elements/${elementId}/upload_asset/`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const deleteAsset = (id) => api.delete(`/assets/${id}/`);
// --------------------------------------------- end Asset Upload APIs --------------------

// ---------------------------------------------- Task Comment APIs -------------------------
export const getTaskComments = (taskId) => api.get(`/stage-elements/${taskId}/comments/`);
export const createTaskComment = (taskId, commentData) => api.post(`/stage-elements/${taskId}/comments/`, commentData);
// --------------------------------------------- end Task Comment APIs --------------------

// --------------------------------------------- end Project Stage Element Template APIs -------------

// ---------------------------------------------- Service APIs -------------------------------------

export const getServices = () => api.get("/services/");
export const getService = (id) => api.get(`/services/${id}/`);
export const createService = (data) => api.post("/services/", data);
export const updateService = (id, data) => api.put(`/services/${id}/`, data);
export const deleteService = (id) => api.delete(`/services/${id}/`);

// --------------------------------------------- end Service APIs -----------------------------------


// ---------------------------------------------- LeadSource APIs ----------------------------------

export const getLeadSources = () => api.get("/lead-sources/");
export const getLeadSource = (id) => api.get(`/lead-sources/${id}/`);
export const createLeadSource = (data) => api.post("/lead-sources/", data);
export const updateLeadSource = (id, data) => api.put(`/lead-sources/${id}/`, data);
export const deleteLeadSource = (id) => api.delete(`/lead-sources/${id}/`);

// --------------------------------------------- end LeadSource APIs --------------------------------


// ---------------------------------------------- LeadAttachment APIs ------------------------------

export const getLeadAttachments = (leadId) => api.get(`/lead-attachments/`, { params: { lead: leadId } });
export const getLeadAttachment = (id) => api.get(`/lead-attachments/${id}/`);
export const createLeadAttachment = (data) => api.post("/lead-attachments/", data); // Data should be FormData for file uploads
export const updateLeadAttachment = (id, data) => api.put(`/lead-attachments/${id}/`, data);
export const deleteLeadAttachment = (id) => api.delete(`/lead-attachments/${id}/`);

// --------------------------------------------- end LeadAttachment APIs ----------------------------


// ---------------------------------------------- LeadServiceItem APIs -----------------------------

export const getLeadServiceItems = (leadId) => api.get(`/lead-service-items/`, { params: { lead: leadId } });
export const getLeadServiceItem = (id) => api.get(`/lead-service-items/${id}/`);
export const createLeadServiceItem = (data) => api.post("/lead-service-items/", data);
export const updateLeadServiceItem = (id, data) => api.put(`/lead-service-items/${id}/`, data);
export const deleteLeadServiceItem = (id) => api.delete(`/lead-service-items/${id}/`);

// --------------------------------------------- end LeadServiceItem APIs --------------------------


// ---------------------------------------------- Quotation APIs -----------------------------------

export const getQuotations = (leadId) => api.get(`/quotations/`, { params: { lead: leadId } });
export const getQuotation = (id) => api.get(`/quotations/${id}/`);
export const createQuotation = (data) => api.post("/quotations/", data);
export const updateQuotation = (id, data) => api.patch(`/quotations/${id}/`, data);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}//`);

export const generateQuotationPdf = (id) => api.post(`/quotations/${id}/generate_pdf/`);
export const sendQuotation = (id) => api.post(`/quotations/${id}/send_quotation/`); // May need data for email details
export const updateQuotationStatus = (id, status) => api.post(`/quotations/${id}/update_status/`, { status });

// --------------------------------------------- end Quotation APIs --------------------------------


// ---------------------------------------------- QuotationItem APIs --------------------------------

export const getQuotationItems = (quotationId) => api.get(`/quotation-items/`, { params: { quotation: quotationId } });
export const getQuotationItem = (id) => api.get(`/quotation-items/${id}/`);
export const createQuotationItem = (data) => api.post("/quotation-items/", data);
export const updateQuotationItem = (id, data) => api.put(`/quotation-items/${id}/`, data);
export const deleteQuotationItem = (id) => api.delete(`/quotation-items/${id}/`);

// --------------------------------------------- end QuotationItem APIs ----------------------------

// ---------------------------------------------- StorageSettings APIs ------------------------------
export const getStorageSettings = () => api.get("/storage-settings/");
export const updateStorageSettings = (data) => api.patch("/storage-settings/", data); 
export const testNasConnection = (data) => api.post("/storage-settings/?action=test-nas", data);
export const testS3Connection = (data) => api.post("/storage-settings/?action=test-s3", data);
// --------------------------------------------- end StorageSettings APIs ---------------------------

// ---------------------------------------------- Folder Structure Template APIs ---------------------
export const getFolderStructureTemplates = () => api.get("/folder-structure-templates/");
export const createFolderStructureTemplate = (data) => api.post("/folder-structure-templates/", data);
export const updateFolderStructureTemplate = (id, data) => api.put(`/folder-structure-templates/${id}/`, data);
export const deleteFolderStructureTemplate = (id) => api.delete(`/folder-structure-templates/${id}/`);
// --------------------------------------------- end Folder Structure Template APIs ------------------

// ---------------------------------------------- Finance APIs -------------------------------------
export const getInvoices = () => api.get("/finance/invoices/");
export const getInvoice = (id) => api.get(`/finance/invoices/${id}/`);
export const createInvoice = (data) => api.post("/finance/invoices/", data);
export const updateInvoice = (id, data) => api.put(`/finance/invoices/${id}/`, data); // Standardized to PUT for full replacement
export const deleteInvoice = (id) => api.delete(`/finance/invoices/${id}/`);
export const getFinanceSummary = () => api.get("/finance/invoices/summary/");

export const getPayments = () => api.get("/finance/payments/");
export const createPayment = (data) => api.post("/finance/payments/", data);
export const deletePayment = (id) => api.delete(`/finance/payments/${id}/`);
// --------------------------------------------- end Finance APIs -----------------------------------
