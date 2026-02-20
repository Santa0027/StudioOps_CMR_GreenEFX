import os
import json
import logging
from django.conf import settings
from .models import Project, ProjectStage, ProjectStageElement, StorageSetting

logger = logging.getLogger(__name__)

def check_nas_connection():
    """
    Verifies if the NAS root path is accessible and writable.
    """
    try:
        storage_settings = StorageSetting.objects.get_singleton()
        nas_root = storage_settings.nas_root_path
        if not os.path.exists(nas_root):
            return False, f"NAS root path {nas_root} does not exist or is not mounted."
        
        # Test write permission
        test_file = os.path.join(nas_root, '.write_test')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        return True, "NAS is accessible."
    except Exception as e:
        return False, f"NAS connection error: {str(e)}"

def create_nas_folders(project):
    """
    Physical creation of folders on NAS based on FolderStructureTemplate.
    """
    if not project.folder_structure_template:
        return False, "No folder structure template assigned to this project."

    nas_ok, msg = check_nas_connection()
    if not nas_ok:
        logger.error(msg)
        return False, msg

    try:
        storage_settings = StorageSetting.objects.get_singleton()
        nas_root = storage_settings.nas_root_path
    except StorageSetting.DoesNotExist:
        return False, "Storage settings (NAS Root) not configured."

    # Project-specific root folder: e.g., /mnt/StudioOps/ProjectName_ID
    # Sanitize project name for filesystem
    safe_project_name = "".join([c if c.isalnum() or c in ('-', '_') else '_' for c in project.name])
    project_folder_name = f"{safe_project_name}_{project.id}"
    project_path = os.path.join(nas_root, project_folder_name)

    structure = project.folder_structure_template.structure

    def create_recursive(base_path, folder_list):
        if not folder_list or not isinstance(folder_list, list):
            return
        
        for folder in folder_list:
            name = folder.get('name')
            if not name:
                continue
            
            # Sanitize folder name: allow only alphanumeric, dash, and underscore
            safe_name = "".join([c if c.isalnum() or c in ('-', '_') else '_' for c in name])
            current_path = os.path.join(base_path, safe_name)
            
            try:
                if not os.path.exists(current_path):
                    os.makedirs(current_path, exist_ok=True)
                
                children = folder.get('children')
                if children:
                    create_recursive(current_path, children)
            except Exception as e:
                logger.error(f"Failed to create folder {current_path}: {e}")

    try:
        if not os.path.exists(project_path):
            os.makedirs(project_path, exist_ok=True)
        
        if isinstance(structure, list):
            create_recursive(project_path, structure)
        elif isinstance(structure, dict):
            create_recursive(project_path, [structure])
            
        return True, project_path
    except Exception as e:
        logger.error(f"Error in create_nas_folders: {e}")
        return False, str(e)

def initialize_project_workflow(project, template=None):
    """
    Automatically creates ProjectStages and ProjectStageElements from a template.
    If template is not provided, it does nothing.
    """
    if not template:
        return False, "No workflow template provided for initialization."

    task_templates = template.task_templates.all()
    
    if not task_templates.exists():
        return False, "Template has no tasks defined."

    # Create the Stage
    # Check if any stages already exist to determine if this one should be 'active'
    is_first_stage = not ProjectStage.objects.filter(project=project).exists()
    
    stage, created = ProjectStage.objects.get_or_create(
        project=project,
        template=template,
        defaults={
            'order': ProjectStage.objects.filter(project=project).count() + 1,
            'status': 'active' if is_first_stage else 'pending'
        }
    )
    
    # Create the Elements (Tasks)
    created_elements = []
    total_elements = task_templates.count()
    contribution = 100 / total_elements if total_elements > 0 else 0
    
    for i, task_tmpl in enumerate(task_templates):
        element, element_created = ProjectStageElement.objects.get_or_create(
            stage=stage,
            template=task_tmpl,
            defaults={
                'order': i + 1,
                'contribution_percentage': contribution,
                'estimated_hours': task_tmpl.default_estimated_hours,
                'status': 'pending'
            }
        )
        created_elements.append(element)
        
    return True, f"Created stage {stage.template.name} with {len(created_elements)} tasks."
