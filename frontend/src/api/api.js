import api from "./axios";

// READ

export const getUsers = () => api.get("/users/");
export const getEmployees = () => api.get("/users/employees/"); // New function to fetch employees


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


export const getleads =() => api.get("/lead/")
// create
export const createlead = (data) => api.post("/lead/",data);
// UPDATE
export const updatelead = (id,data) => api.put(`/lead/${id}/`,data);
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
export const updateProject = (id, data) => api.put(`/projects/${id}/`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}/`);
export const getProjectVersions = (projectId) => api.get(`/projects/${projectId}/versions/`);

// --------------------------------------------- end Project APIs -----------------------------------

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

// --------------------------------------------- end Project Stage Element Template APIs -------------