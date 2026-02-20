**Media Handling and Storage Report for CRM_StudioOps Project**

**1. Overview**
The CRM_StudioOps project currently utilizes local filesystem storage as its primary method for handling media and file uploads. However, there are clear indications of planned enhancements, including integration with Network Attached Storage (NAS) and cloud storage solutions.

**2. Storage Configuration**

*   **Local Storage:**
    *   **`backend/backend/settings.py`**: The project is configured to use Django's default filesystem storage. `MEDIA_ROOT` is set to the 'media' directory within the 'backend' folder, meaning all uploaded files are stored locally in this directory. `MEDIA_URL` is configured for accessing these files via the web server.

*   **NAS Configuration:**
    *   **`backend/project/utils/storages.py`**: A custom storage backend named `nas_storage` is defined, pointing to `/mnt/StudioOps`. This indicates an intention to use a Network Attached Storage (NAS) at this mount point.
    *   **Current Usage Status**: As of the current investigation, the `nas_storage` backend does not appear to be actively used or referenced anywhere else in the codebase beyond its definition. This suggests it might be a placeholder for future implementation or a remnant of an earlier design decision.
    *   **Adobe Integration Implication**: The `adobe-scripts/Photoshop/CrmConnector.jsx` includes a `SERVER_BASE_PATH` variable and an "Open Project Folder" button that attempts to access project folders based on this path. This strongly suggests that creative professionals are expected to access project files directly from a shared network location (like a NAS), aligning with the `nas_storage` definition, even if not directly managed by Django's storage system yet.

*   **Cloud Storage:**
    *   **`backend/project/views.py`**: A `TODO` comment explicitly states: `# TODO: Replace with presigned cloud URL (S3 / GCS / MinIO)`. This confirms that integration with cloud storage services (such as AWS S3, Google Cloud Storage, or MinIO) using presigned URLs for secure asset streaming is a planned feature.
    *   **`ProjectAsset` Model**: The `ProjectAsset` model includes `STORAGE_LOCATION_CHOICES` with options for `("local", "Local Server")` and `("cloud", "Cloud Server")`. While it defaults to "local", this field is in place to support future cloud integration, allowing the system to track where an asset is physically stored.
    *   **Current Implementation Status**: There is no active implementation of cloud storage identified within the current codebase; it remains a planned enhancement.

**3. Types of Files Managed**
The system is designed to handle a diverse range of file types, categorized and managed across several models:

*   **`ProjectAsset` (in `backend/project/models.py`):** This model is central to managing creative assets and defines explicit `ASSET_TYPE_CHOICES` and `ASSET_ROLE_CHOICES`:
    *   **Asset Types:**
        *   `"psd"` (Photoshop Document)
        *   `"ai"` (Adobe Illustrator Document)
        *   `"ae"` (Adobe After Effects Project)
        *   `"pr"` (Adobe Premiere Pro Project)
        *   `"video"` (General video files)
        *   `"image"` (General image files)
        *   `"other"` (Any other file type)
    *   **Asset Roles:**
        *   `"source"` (Source File)
        *   `"preview"` (Preview Render)
        *   `"final"` (Final Deliverable)

*   **`StageElementVersion` (in `backend/project/models.py`):**
    *   `file = models.FileField(upload_to="stage_element_versions/")`: This allows for the upload of various file types as different versions of project stage elements, suggesting that creative outputs or supporting documents can be version-controlled.

*   **`LeadAttachment` (in `backend/Sales/models.py`):**
    *   `file = models.FileField(upload_to="lead_attachments/")`: This enables the attachment of general file types to sales leads, likely for supporting documents, presentations, or client-provided assets.

*   **`Quotation` (in `backend/Sales/models.py`):**
    *   `pdf_file = models.FileField(upload_to="quotations/")`: Specifically handles PDF documents for quotations, indicating a requirement for managing standardized document formats.

*   **`Payslip` (in `backend/HR_Payroll/models.py`):**
    *   `file = models.FileField(upload_to="payslips/")`: Used for uploading payslip documents, which are typically PDFs or other structured document formats.

*   **Implied Adobe Project Files:** The `adobe-scripts` (e.g., `HelloWorld.jsx` examples) demonstrate interaction with native project files of Adobe After Effects (`.aep`), Photoshop (`.psd`), and Premiere Pro (`.prproj`), among others, which are the primary files handled by the creative team.

**4. Folder Management**
The project implements a robust and programmatic approach to folder management, crucial for organizing creative projects and assets:

*   **`FolderStructureTemplate` Model (in `backend/project/models.py`):**
    *   This model allows administrators to define custom folder structures using a `JSONField` (`structure`). This `JSONField` stores a tree-like representation of the desired folder hierarchy.
    *   This enables the creation of standardized project folder layouts, ensuring consistency across different projects.

*   **`backend/utils/folder_structure_generator.py` Utility:**
    *   This module contains the core logic for translating folder structure templates into physical directories.
    *   `parse_structure_to_tree()`: Converts indented text representations of folder structures into a programmatic tree (list of dictionaries).
    *   `tree_to_lines()`: The inverse, converting a tree structure back to indented lines.
    *   `create_folders(base_path, tree)`: The key function that takes a base path and a folder structure tree, then uses `os.makedirs` to create the corresponding directories on the filesystem. This function includes error handling for robust folder creation.

*   **Dynamic Folder Paths (`project_asset_upload_path`):**
    *   Within the `ProjectAsset` model, the `project_asset_upload_path` function dynamically generates upload paths for assets. This path is constructed based on:
        *   `project_name` (e.g., `My_Project`)
        *   `stage_name` (e.g., `Pre-production`)
        *   `asset_role` (e.g., `source`, `preview`, `final`)
    *   This ensures that assets are automatically organized into a logical, project-specific folder hierarchy (`<project_name>/<stage_name>/<role>/<filename>`), complementing the overarching folder structure templates.

**5. Adobe Integration and Workflow**
The `adobe-scripts` indicate a tightly integrated workflow between the CRM system and Adobe Creative Cloud applications:

*   **CRM Connector Panels (`CrmConnector.jsx`):** These scripts create dockable panels within After Effects, Photoshop, and Premiere Pro. They enable artists to:
    *   Log in to the CRM backend.
    *   Fetch and view a list of assigned tasks (stage elements) directly within their creative environment.
    *   The Photoshop version specifically includes an "Open Project Folder" button.

*   **Shared Storage Access:** The `SERVER_BASE_PATH` and "Open Project Folder" functionality in the Photoshop connector implies that artists are expected to work with project files stored on a shared network location (likely a NAS or a designated server directory) that is directly accessible from their workstations. The CRM primarily acts as a task management and metadata tracking system, while the actual heavy lifting of file manipulation occurs locally on the artist's machine accessing shared storage.

*   **Implied Workflow:**
    1.  Project and tasks are defined in the CRM, potentially leveraging `FolderStructureTemplate` to set up project directories.
    2.  Artists use Adobe applications to perform tasks.
    3.  The `CrmConnector` allows artists to see their assigned tasks and navigate to the relevant project folders on the shared storage.
    4.  Assets created or modified by artists (e.g., PSD, AE projects, video renders) are saved to these shared folders, and their metadata (type, role, version) can be tracked in the `ProjectAsset` and `StageElementVersion` models in the CRM.
    5.  Files uploaded to the CRM (e.g., `LeadAttachment`, `Quotation` PDFs, `Payslip`s) are stored locally within the `backend/media/` directory.

In summary, the CRM_StudioOps project has a well-defined structure for managing creative assets and documents, with a clear roadmap for expanding storage capabilities to include NAS and cloud solutions. Folder organization is highly programmatic, and there is an evident integration strategy with Adobe Creative Cloud for a seamless creative workflow.