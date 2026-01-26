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
export const createProject = (data) => api.post("/projects/", data);
export const updateProject = (id, data) => api.put(`/projects/${id}/`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}/`);

// --------------------------------------------- end Project APIs -----------------------------------
