# ProjectManagement/tasks.py
import os
from celery import shared_task
from django.core.files.storage import default_storage
from django.db.models import Max
from .models import ProjectAsset, StageElementVersion

@shared_task(bind=True)
def process_project_asset(self, asset_id):
    """
    Task to process uploaded project asset:
    - Move to centralized storage (local/cloud)
    - Auto-create a stage element version
    """
    from .models import ProjectStageElement

    try:
        asset = ProjectAsset.objects.get(pk=asset_id)

        # Validate file type
        if asset.asset_type not in ["psd", "ai", "ae", "pr"]:
            raise ValueError(f"Unsupported asset type: {asset.asset_type}")

        # Centralized storage path
        project_name = asset.element.stage.project.name.replace(" ", "_")
        stage_name = asset.element.stage.template.name.replace(" ", "_")
        role = asset.asset_role.lower()
        filename = os.path.basename(asset.file.name)
        centralized_path = f"{project_name}/{stage_name}/{role}/{filename}"

        # Save to centralized storage (local)
        if asset.storage_location == "local":
            new_path = default_storage.save(centralized_path, asset.file)
            asset.file.name = new_path
            asset.processed = True
            asset.save()

        # Auto-create StageElementVersion
        generate_stage_version.delay(asset.element.id, description="Auto version from asset")

        return f"Asset {asset_id} processed successfully"

    except ProjectAsset.DoesNotExist:
        return f"Asset {asset_id} not found"
    except Exception as e:
        return str(e)


@shared_task(bind=True)
def generate_stage_version(self, element_id, description="", hours_spent=0):
    """
    Automatically create a version for a stage element
    """
    from .models import ProjectStageElement

    try:
        element = ProjectStageElement.objects.get(pk=element_id)
        version_number = element.versions.aggregate(
            max_v=Max("version_number")
        )["max_v"] or 0
        version_number += 1

        StageElementVersion.objects.create(
            element=element,
            version_number=version_number,
            description=description,
            file=None,  # attach file if needed
            hours_spent=hours_spent,
            status="pending",
            created_by=element.stage.project.created_by
        )

        return f"Version {version_number} created for element {element_id}"
    except ProjectStageElement.DoesNotExist:
        return f"Element {element_id} not found"
    except Exception as e:
        return str(e)
