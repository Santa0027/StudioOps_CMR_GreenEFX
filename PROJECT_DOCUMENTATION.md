# CRM_StudioOps - Project Architecture & End-to-End Flow

This document outlines the technical architecture and data flow of the CRM_StudioOps project.

## 1. High-Level Overview

CRM_StudioOps is a full-stack web application designed as a comprehensive Customer Relationship Management (CRM) and operations tool for a studio environment. It features a modern web interface for users, a robust backend for business logic, and unique integration with Adobe Creative Cloud applications.

**Core Technologies:**

*   **Backend:** Python with the Django framework.
*   **Frontend:** JavaScript with the React library, built with Vite and styled with Tailwind CSS.
*   **Adobe Integration:** ExtendScript (`.jsx`) for Photoshop, Premiere Pro, and After Effects.
*   **Database:** A relational database (like PostgreSQL or MySQL) managed by the Django ORM.

The application follows a classic **client-server architecture**. The React frontend is the client, making API requests to the Django backend, which acts as the server.

---

## 2. Core Components

### 2.1. Backend (Django Application)

The `backend/` directory contains the heart of the application's business logic.

*   **Role:**
    *   Exposes a **RESTful API** for the frontend and Adobe scripts to consume.
    *   Handles user authentication and permissions.
    *   Manages all data models and interactions with the database.
    *   Executes business logic for all CRM and studio operations.

*   **Structure:** The backend is organized into several Django "apps," each responsible for a specific domain:
    *   `project/`: Core project management. Handles creation, tracking, tasks, assets, and project stages.
    *   `finance/`: Financial aspects. Manages invoices, and likely client billing and expenses.
    *   `Sales/`: Sales pipeline management. Tracks leads, clients, and follow-ups.
    *   `HR_Payroll/`: Human resources and payroll functions. Manages user roles, attendance, and employee data.

*   **Key Files:**
    *   `manage.py`: The command-line utility for running the Django application.
    *   `settings.py`: Contains all project configurations, including database connections and installed apps.
    *   `models.py` (in each app): Defines the database schema using Django's Object-Relational Mapper (ORM).
    *   `views.py` (in each app): Contains the logic to handle incoming API requests.
    *   `serializers.py` (in each app): Defines how complex data (like database models) is converted to and from JSON for the API. This confirms the use of **Django REST Framework**.
    *   `urls.py` (in each app): Maps specific API endpoints (URLs) to the corresponding view functions.

### 2.2. Frontend (React Application)

The `frontend/` directory contains the user-facing part of the application.

*   **Role:**
    *   Provides a dynamic and interactive User Interface (UI) for all CRM features.
    *   Manages the user session and application state.
    *   Communicates with the backend via API calls to fetch and submit data.

*   **Structure:** It's a modern React project built with Vite for fast development.
    *   `src/components/`: The core of the UI. It is broken down into reusable components, each representing a piece of the interface (e.g., `Dashboard.jsx`, `ClientManagement.jsx`, `CreateNewProject.jsx`).
    *   `src/context/AuthContext.jsx`: Manages the application's authentication state, holding the logged-in user's data and authentication tokens.
    *   `vite.config.js`: Configuration for the frontend build tool.
    *   `package.json`: Lists all frontend dependencies (like React, Tailwind CSS) and scripts for running the development server (`npm run dev`).

### 2.3. Adobe Creative Cloud Integration

The `adobe-scripts/` directory is a unique feature that directly connects the CRM to the creative workflow.

*   **Role:**
    *   Allows artists and editors to interact with the CRM directly from within Adobe software.
    *   Likely used to fetch project details, task assignments, and project assets.
    *   May be used to upload finished work, track time, or update task statuses without leaving the creative application.

*   **Structure:** Contains separate `CrmConnector.jsx` scripts for After Effects, Photoshop, and Premiere Pro. These scripts are written in ExtendScript (Adobe's JavaScript-based scripting language) and would be installed into the respective Adobe applications. They almost certainly make HTTP requests to the Django backend API.

---

## 3. End-to-End Project Flow (Example Scenarios)

### Scenario 1: A Salesperson Adds a New Lead

1.  **Frontend:** The user logs in and navigates to the "Sales" or "Leads" section of the React application.
2.  **Frontend:** They fill out the "Add New Lead" form and click "Submit."
3.  **API Request:** The React app sends a `POST` request to a backend API endpoint like `/api/sales/leads/` with the new lead's data in JSON format.
4.  **Backend:** The Django view corresponding to that URL receives the request. The serializer validates the incoming data.
5.  **Database:** If the data is valid, a new `Lead` instance is created and saved to the database.
6.  **API Response:** The backend sends a `201 Created` success response back to the frontend, including the data for the newly created lead.
7.  **Frontend:** The React app's UI updates to show the new lead in the list, confirming the success of the operation.

### Scenario 2: An Artist Works on a Project Task
``\
1.  **Adobe Premiere Pro:** An editor opens Premiere Pro to work on a video for a project.
2.  **Adobe Script:** They run the `CrmConnector.jsx` script from within Premiere.
3.  **API Request:** The script sends a `GET` request to the backend API (e.g., `/api/projects/my-tasks/`) to fetch the user's assigned tasks. The request is authenticated with a token.
4.  **Backend:** Django retrieves the user's tasks from the database and sends them back as a JSON response.
5.  **Adobe Script:** The script's UI panel in Premiere Pro displays the list of tasks. The editor can see details, read notes, and perhaps download required assets (which would trigger another API call).
6.  **Workflow:** The editor completes their work.
7.  **API Request:** They use the script panel to mark the task as "Complete" or "Ready for Review." This triggers a `PUT` or `PATCH` request to the backend API (e.g., `/api/projects/tasks/123/`), updating the task's status.
8.  **Database:** The backend updates the task's status in the database.
9.  **Frontend (Manager View):** When a manager views the `ProjectDetails.jsx` page in the web app, it will now show the updated task status, as the frontend fetches this data from the same backend API.
