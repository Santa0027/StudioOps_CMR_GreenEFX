"""
Views for StudioOps Project Management System
=============================================

This module contains the API endpoints for:
1. INTERNAL APIs – Studio / Team (Admins, PMs, Editors, Designers)
2. CLIENT APIs – Read-only access for project review and approvals
3. Asset Streaming – Secure streaming with no direct download

Optional Enhancements Implement:
- Rate limiting on asset streaming
- Permission classes
- Soft delete placeholders
- OpenAPI documentation via drf-spectacular
"""

from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status # Import status for HTTP status codes
from rest_framework.parsers import MultiPartParser, FormParser # New import
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .tasks import process_project_asset, create_project_folder_structure
from django.utils import timezone
import os # Import os for path manipulation
from django.views.static import serve # Added for serving NAS files
from django.conf import settings # Added for settings access
from common.permissions.model_permissions import DjangoModelPermissionsWithView

def serve_nas_media(request, path):
    """
    Custom view to serve files from NAS path defined in StorageSetting.
    """
    try:
        storage_settings = StorageSetting.objects.get_singleton()
        nas_root = storage_settings.nas_root_path
    except Exception:
        nas_root = settings.NAS_MEDIA_ROOT
    
    return serve(request, path, document_root=nas_root)

from .models import *
from .serializers import ProjectSerializer, ProjectAssetUploadSerializer,ProjectStageElementDetailSerializer, ProjectAssetSerializer, StageElementVersionSerializer, ProjectTimeLogSerializer, ClientProjectAssetSerializer, ClientProjectStageElementSerializer, ClientReviewLogSerializer, PackageSerializer, PackageItemSerializer, ProjectStageTemplateSerializer, ProjectStageElementTemplateSerializer, ProjectTaskAssignmentSerializer, TaskCommentSerializer, FolderStructureTemplateSerializer, StorageSettingSerializer
from common.utils.folder_structure_generator import parse_structure_to_tree, create_folders
from .permissions import IsInternalUser, IsClientUser
from .throttles import AssetStreamRateThrottle


# ==========================================================
# INTERNAL API VIEWS
# ==========================================================

@extend_schema(
    tags=["Internal - Projects"],
    summary="Create & manage studio projects",
)
class ProjectViewSet(ModelViewSet):
    """
    CRUD for Projects
    - Create: Onboarding new project
    - Update: Project details, priority, status
    - List / Retrieve: Studio team only
    """
    serializer_class = ProjectSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        user = self.request.user
        # Admins and Managers see everything
        if user.is_superuser or user.groups.filter(name__in=['Admin', 'Manager']).exists():
            return Project.objects.all()
        
        # Others see only assigned projects
        return Project.objects.filter(assigned_users=user).distinct()

    def create(self, request, *args, **kwargs):
        # Make a mutable copy of the request data
        data = request.data.copy()

        # Extract workflow_template_ids from the copied data, if present
        workflow_template_ids = data.pop('workflow_template_ids', [])
        folder_structure_template_id = data.pop('folder_structure_template_id', None) # Extract new field
        base_path = data.pop('base_path', None) # Extract base_path for folder creation
        
        # Validate and create the project instance using the modified data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Save project first to get an instance
        project = serializer.save(created_by=self.request.user)

        if workflow_template_ids:
            try:
                for order, template_id in enumerate(workflow_template_ids):
                    # Retrieve the workflow template with its associated element templates
                    workflow_template = ProjectStageTemplate.objects.prefetch_related(
                        'task_templates'
                    ).get(id=template_id)

                    # Create ProjectStage instances for each template
                    project_stage = ProjectStage.objects.create(
                        project=project,
                        template=workflow_template,
                        order=order, # Set order based on the list
                        status="active" if order == 0 else "pending"
                    )

                    # Create ProjectStageElement instances for the new project stage
                    for element_order, element_template in enumerate(workflow_template.task_templates.all()):
                        ProjectStageElement.objects.create(
                            stage=project_stage,
                            template=element_template,
                            order=element_order,
                            contribution_percentage=0, # Default contribution
                            estimated_hours=element_template.default_estimated_hours,
                            status="pending"
                        )

            except ProjectStageTemplate.DoesNotExist:
                # If any template not found, return an error and delete the created project
                project.delete()
                return Response(
                    {"workflow_template_ids": [f"Workflow template with id {template_id} not found."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                # Catch other potential errors
                project.delete()
                return Response(
                    {"detail": f"Error creating project stages from templates: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Trigger Celery task for folder creation if template and base_path are provided
        if folder_structure_template_id and base_path:
            create_project_folder_structure.delay(
                project.id,
                folder_structure_template_id,
                base_path
            )

        # Re-serialize the project to include the newly created stages in the response
        project.refresh_from_db()
        final_serializer = self.get_serializer(project)
        headers = self.get_success_headers(final_serializer.data)
        return Response(final_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()

        workflow_template_ids = data.pop('workflow_template_ids', [])
        folder_structure_template_id = data.pop('folder_structure_template_id', None)
        base_path = data.pop('base_path', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle Workflow Templates if provided during update
        if workflow_template_ids:
            try:
                for template_id in workflow_template_ids:
                    workflow_template = ProjectStageTemplate.objects.prefetch_related(
                        'task_templates'
                    ).get(id=template_id)

                    # Check if this stage already exists for the project to avoid duplicates
                    if not ProjectStage.objects.filter(project=instance, template=workflow_template).exists():
                        current_stages_count = ProjectStage.objects.filter(project=instance).count()
                        
                        project_stage = ProjectStage.objects.create(
                            project=instance,
                            template=workflow_template,
                            order=current_stages_count,
                            status="active" if current_stages_count == 0 else "pending"
                        )

                        for element_order, element_template in enumerate(workflow_template.task_templates.all()):
                            ProjectStageElement.objects.create(
                                stage=project_stage,
                                template=element_template,
                                order=element_order,
                                contribution_percentage=0,
                                estimated_hours=element_template.default_estimated_hours,
                                status="pending"
                            )
            except Exception as e:
                return Response(
                    {"detail": f"Error updating project stages: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Trigger Celery task for folder creation if template and base_path are provided
        if folder_structure_template_id and base_path:
            create_project_folder_structure.delay(
                instance.id,
                folder_structure_template_id,
                base_path
            )

        return Response(serializer.data)

    def perform_create(self, serializer):
        # This perform_create is now redundant because create method is overridden
        # Keeping it for consistency in case create method logic changes later,
        # but it won't be called by the current create method
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], serializer_class=StageElementVersionSerializer)
    def upload_version(self, request, pk=None):
        project = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Internal - Stage Elements"],
    summary="Manage stage elements / tasks inside project stages",
)
class ProjectStageElementViewSet(ModelViewSet):
    """
    Full access to Stage Elements
    - Tracks contribution %, status, estimated / actual hours
    - Internal rejection notes visible
    - Can filter by project_id
    """
    serializer_class = ProjectStageElementDetailSerializer
    permission_classes = [DjangoModelPermissionsWithView, IsInternalUser]

    def get_queryset(self):
        user = self.request.user
        queryset = ProjectStageElement.objects.select_related("stage", "template").filter(stage__status='active')
        
        # Admins and Managers see all tasks
        if not (user.is_superuser or user.groups.filter(name__in=['Admin', 'Manager']).exists()):
            # Others see tasks in projects they are assigned to OR tasks they are specifically assigned to
            queryset = queryset.filter(
                models.Q(stage__project__assigned_users=user) | 
                models.Q(assignments__user=user)
            )

        project_id = self.request.query_params.get("project_id")
        if project_id:
            queryset = queryset.filter(stage__project_id=project_id)
        
        return queryset.distinct()

    def perform_create(self, serializer):
        # Pass the request.user to the save method for TaskStatusLog
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Pass the request.user to the save method for TaskStatusLog
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser], serializer_class=ProjectAssetUploadSerializer)
    def upload_asset(self, request, pk=None):
        element = self.get_object()
        print("--- Inside upload_asset view ---")
        print("request.data:", request.data)
        print("request.FILES:", request.FILES)
        serializer = self.get_serializer(data=request.data, context={'element': element, 'request': request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user) # Assuming request.user is available
            # Optionally trigger async processing here if needed, e.g., for video transcoding
            if process_project_asset: # Check if the task is imported and available
                process_project_asset.delay(serializer.instance.id) # Assuming this task exists
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsInternalUser])
    def request_manager_approval(self, request, pk=None):
        """
        Allows a user to request manager approval for a task.
        Sets manager_approval_status to 'pending' and task status to 'waiting_review'.
        """
        task = self.get_object()
        
        # Validation: Check if at least one asset exists
        if not task.assets.exists():
            return Response(
                {"detail": "Cannot request manager approval without uploading any work assets."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check current status, only allow if not already waiting for review or completed
        if task.status in ['waiting_review', 'completed', 'waiting_client_review']:
            return Response(
                {"detail": f"Task is already '{task.status}' and cannot request manager approval."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.manager_approval_status = "pending"
        task.status = "waiting_review"
        task.manager_rework_notes = "" # Clear any previous rework notes
        task.save(user=request.user) # Pass user for logging

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsInternalUser])
    def approve_manager_review(self, request, pk=None):
        """
        Allows a manager to approve a task.
        Changes manager_approval_status to 'approved' and sets approved_by/at.
        """
        task = self.get_object()

        if task.manager_approval_status == "approved":
            return Response(
                {"detail": "Task is already manager approved."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.status != "waiting_review":
            return Response(
                {"detail": "Task is not in 'waiting_review' status for manager approval."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.manager_approval_status = "approved"
        task.manager_approved_by = request.user
        task.manager_approved_at = timezone.now()
        task.status = "in_progress" # Manager approved, now ready for next step (e.g., client staging)
        task.save(user=request.user)

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsInternalUser])
    def reject_manager_review(self, request, pk=None):
        """
        Allows a manager to reject a task, requiring rework notes.
        Changes manager_approval_status to 'rejected' and task status to 'in_progress'.
        """
        task = self.get_object()
        rework_notes = request.data.get("rework_notes", "").strip()

        if not rework_notes:
            return Response(
                {"rework_notes": "Rework notes are required when rejecting manager review."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.manager_approval_status == "rejected":
            return Response(
                {"detail": "Task is already manager rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.status != "waiting_review":
            return Response(
                {"detail": "Task is not in 'waiting_review' status for manager rejection."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.manager_approval_status = "rejected"
        task.manager_rework_notes = rework_notes
        task.status = "in_progress"  # Back to in_progress for rework
        task.manager_approved_by = None # Clear previous approval
        task.manager_approved_at = None # Clear previous approval time
        task.save(user=request.user)

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsInternalUser])
    def stage_for_client_review(self, request, pk=None):
        """
        Allows an internal user to stage a task for client review.
        Requires manager approval first.
        Sets staged_for_client_review to True, client_approval_status to 'requested',
        and task status to 'waiting_client_review'.
        """
        task = self.get_object()

        if task.manager_approval_status != "approved":
            return Response(
                {"detail": "Task must be manager approved before staging for client review."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.staged_for_client_review:
            return Response(
                {"detail": "Task is already staged for client review."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.status == "waiting_client_review":
            return Response(
                {"detail": "Task is already in 'waiting_client_review' status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.staged_for_client_review = True
        task.client_approval_status = "requested"
        task.status = "waiting_client_review"
        task.client_rework_notes = "" # Clear any previous rework notes
        task.save(user=request.user)

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsClientUser])
    def client_approve(self, request, pk=None):
        """
        Allows a client to approve a task that has been staged for their review.
        """
        task = self.get_object()

        if not task.staged_for_client_review or task.client_approval_status != "requested":
            return Response(
                {"detail": "Task is not currently awaiting client approval."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.client_approval_status == "approved":
            return Response(
                {"detail": "Task is already client approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.client_approval_status = "approved"
        task.client_approved_by = request.user
        task.client_approved_at = timezone.now()
        
        # If manager also approved, set to completed, otherwise keep it as waiting_client_review
        # or another appropriate status if further internal steps are needed.
        # For simplicity, if manager approved and client approved, it's completed.
        if task.manager_approval_status == "approved":
            task.status = "completed"
        # else: task remains waiting_client_review, or could go to 'in_progress' if manager approval isn't final step

        task.save(user=request.user)

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsClientUser])
    def client_reject(self, request, pk=None):
        """
        Allows a client to reject a task, requiring rework notes.
        Changes client_approval_status to 'rejected' and task status to 'in_progress'.
        """
        task = self.get_object()
        rework_notes = request.data.get("rework_notes", "").strip()

        if not rework_notes:
            return Response(
                {"rework_notes": "Rework notes are required when rejecting client review."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not task.staged_for_client_review or task.client_approval_status != "requested":
            return Response(
                {"detail": "Task is not currently awaiting client approval."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if task.client_approval_status == "rejected":
            return Response(
                {"detail": "Task is already client rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.client_approval_status = "rejected"
        task.client_rework_notes = rework_notes
        task.status = "in_progress"  # Back to in_progress for rework
        task.client_approved_by = None # Clear previous approval
        task.client_approved_at = None # Clear previous approval time
        task.staged_for_client_review = False # No longer staged
        task.save(user=request.user)

        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)



@extend_schema(
    tags=["Internal - Project Assets"],
    summary="Manage project assets (source, preview, final)",
)
class ProjectAssetViewSet(ModelViewSet):
    """
    Internal asset management:
    - Upload source files (PSD, AI, AE, PR)
    - Upload preview / final renders
    - Hybrid storage: Local or Cloud
    """
    serializer_class = ProjectAssetSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        user = self.request.user
        queryset = ProjectAsset.objects.all()
        
        # Admins and Managers see all assets
        if not (user.is_superuser or user.groups.filter(name__in=['Admin', 'Manager']).exists()):
            # Others see assets linked to tasks they are assigned to OR projects they are assigned to
            queryset = queryset.filter(
                models.Q(element__stage__project__assigned_users=user) | 
                models.Q(element__assignments__user=user)
            )
        
        return queryset.distinct()

    def perform_create(self, serializer):
        # Hook for async upload / background processing
        serializer.save(uploaded_by=self.request.user)
        # Assuming `asset` is available in this scope, which it's not if coming from serializer.save()
        # This line might need adjustment to get the actual instance created by the serializer
        # For now, commenting out the process_project_asset.delay call to avoid an error
        # process_project_asset.delay(asset.id) # TODO: Pass the actual created asset ID

    @action(detail=True, methods=['post'], permission_classes=[IsInternalUser])
    def set_client_review_status(self, request, pk=None):
        """
        Sets the client_review status for a specific ProjectAsset.
        This determines if the asset is visible to clients.
        """
        asset = self.get_object()
        is_client_review = request.data.get("is_client_review")

        if is_client_review is None or not isinstance(is_client_review, bool):
            return Response(
                {"is_client_review": "This field is required and must be a boolean."},
                status=status.HTTP_400_BAD_REQUEST
            )

        asset.client_review = is_client_review
        asset.save()

        serializer = self.get_serializer(asset)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Internal - Stage Element Versions"],
    summary="Revision history for stage elements",
)
class StageElementVersionViewSet(ModelViewSet):
    """
    Versioning for each task:
    - Tracks hours spent per revision
    - Supports rollback
    """
    serializer_class = StageElementVersionSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        project_pk = self.kwargs.get('project_pk')
        if project_pk:
            return StageElementVersion.objects.filter(element__stage__project_id=project_pk)
        return StageElementVersion.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # TODO: Hook for audit log of version creation


@extend_schema(
    tags=["Internal - Time Logs"],
    summary="Track time spent per task",
)
class ProjectTimeLogViewSet(ModelViewSet):
    """
    Logs working hours for tasks
    """
    queryset = ProjectTimeLog.objects.all()
    serializer_class = ProjectTimeLogSerializer
    permission_classes = [DjangoModelPermissionsWithView]


# ==========================================================
# CLIENT API VIEWS
# ==========================================================

@extend_schema(
    tags=["Client - Assets"],
    summary="Client view of approved project assets",
)
class ClientProjectAssetViewSet(ReadOnlyModelViewSet):
    """
    Client-visible assets only:
    - cloud storage
    - client_review=True
    - Preview / final deliverables
    """
    serializer_class = ClientProjectAssetSerializer
    permission_classes = [DjangoModelPermissionsWithView, IsClientUser]

    def get_queryset(self):
        return ProjectAsset.objects.filter(
            client_review=True,
            storage_location="cloud"
        )


@extend_schema(
    tags=["Client - Stage Elements"],
    summary="Client view of stage elements/tasks",
)
class ClientProjectStageElementViewSet(ReadOnlyModelViewSet):
    """
    Client-visible stage elements:
    - Shows task status
    - Shows rejection notes
    - Only tasks with client_review assets
    """
    serializer_class = ClientProjectStageElementSerializer
    permission_classes = [DjangoModelPermissionsWithView, IsClientUser]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")

        qs = ProjectStageElement.objects.filter(
            assets__client_review=True,
            assets__storage_location="cloud"
        )

        if project_id:
            qs = qs.filter(stage__project_id=project_id)

        return qs.distinct()


@extend_schema(
    tags=["Client - Reviews"],
    summary="Client logs for approvals / rejections",
)
class ClientReviewLogViewSet(ModelViewSet):
    """
    Client approvals / review notes
    """
    queryset = ClientReviewLog.objects.all()
    serializer_class = ClientReviewLogSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def perform_create(self, serializer):
        serializer.save(reviewed_by=self.request.user)
        # TODO: Trigger internal notification / version creation


# ==========================================================
# ASSET STREAMING (Client Secure Streaming)
# ==========================================================

@extend_schema(
    tags=["Client - Asset Streaming"],
    summary="Stream asset securely (no download)",
    responses={
        200: OpenApiResponse(
            description="Signed streaming URL",
            response={
                "type": "object",
                "properties": {
                    "stream_url": {"type": "string"},
                    "expires_in": {"type": "integer"},
                },
            },
        ),
        403: OpenApiResponse(description="Permission denied"),
        404: OpenApiResponse(description="Asset not found"),
    },
)
class AssetStreamView(APIView):
    """
    Returns signed streaming URLs for assets
    - Only client_review assets
    - Only cloud stored assets
    - Rate-limited via AssetStreamRateThrottle
    """
    permission_classes = [IsAuthenticated, IsClientUser]
    throttle_classes = [AssetStreamRateThrottle]

    def get(self, request, asset_id):
        asset = get_object_or_404(
            ProjectAsset,
            id=asset_id,
            client_review=True,
            storage_location="cloud"
        )

        # TODO: Replace with presigned cloud URL (S3 / GCS / MinIO)
        signed_url = asset.file.url

        return Response({
            "stream_url": signed_url,
            "expires_in": 300
        })


# ==========================================================
# PACKAGES API VIEWS
# ==========================================================

@extend_schema(
    tags=["Internal - Packages"],
    summary="Create & manage work packages and their items",
)
class PackageViewSet(ModelViewSet):
    """
    CRUD for Work Packages and their associated items.
    """
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [DjangoModelPermissionsWithView]


@extend_schema(
    tags=["Internal - Package Items"],
    summary="Manage items within a specific work package",
)
class PackageItemViewSet(ModelViewSet):
    """
    CRUD for Package Items.
    Items are nested under a specific Package.
    """
    serializer_class = PackageItemSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        # Filter items by the package_pk provided in the URL
        return PackageItem.objects.filter(package=self.kwargs['package_pk'])

    def perform_create(self, serializer):
        # Automatically assign the package based on the URL
        package = get_object_or_404(Package, pk=self.kwargs['package_pk'])
        serializer.save(package=package)

# ==========================================================
# PROJECT STAGE TEMPLATE VIEWS
# ==========================================================

@extend_schema(
    tags=["Internal - Project Stage Templates"],
    summary="Create & manage global project stage templates",
)
class ProjectStageTemplateViewSet(ModelViewSet):
    """
    CRUD for Project Stage Templates.
    These define reusable stages for projects.
    """
    queryset = ProjectStageTemplate.objects.all()
    serializer_class = ProjectStageTemplateSerializer
    permission_classes = [DjangoModelPermissionsWithView]


@extend_schema(
    tags=["Internal - Project Stage Element Templates"],
    summary="Manage elements/tasks within a project stage template",
)
class ProjectStageElementTemplateViewSet(ModelViewSet):
    """
    CRUD for Project Stage Element Templates.
    These define reusable tasks within a stage template.
    Items are nested under a specific ProjectStageTemplate.
    """
    serializer_class = ProjectStageElementTemplateSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        # Filter elements by the stage_pk provided in the URL
        return ProjectStageElementTemplate.objects.filter(stage=self.kwargs['stage_pk'])

    def perform_create(self, serializer):
        # Automatically assign the stage template based on the URL
        stage_template = get_object_or_404(ProjectStageTemplate, pk=self.kwargs['stage_pk'])
        serializer.save(stage=stage_template)
# ==========================================================
# PROJECT TASK ASSIGNMENT VIEWS
# ==========================================================

@extend_schema(
    tags=["Internal - Task Assignments"],
    summary="Assign users to tasks",
)
class ProjectTaskAssignmentViewSet(ModelViewSet):
    """
    CRUD for Task Assignments.
    Assignments are nested under a specific ProjectStageElement (task).
    """
    serializer_class = ProjectTaskAssignmentSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        # Filter assignments by the task_pk provided in the URL
        return ProjectTaskAssignment.objects.filter(task=self.kwargs['task_pk'])

    def create(self, request, *args, **kwargs):
        task_pk = self.kwargs.get('task_pk')
        
        # Make a mutable copy of request.data and inject the task_pk
        mutable_data = request.data.copy()
        mutable_data['task'] = task_pk
        
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        assignment = serializer.save()
        # Automatically sync the assignment's initial notes to the task's main notes 
        # if the task currently has no notes.
        task = assignment.task
        if assignment.initial_notes and (not task.initial_notes or task.initial_notes == "None"):
            task.initial_notes = assignment.initial_notes
            task.save(update_fields=['initial_notes'])


# ==========================================================
# TASK COMMENT VIEWS
# ==========================================================

@extend_schema(
    tags=["Internal - Task Comments"],
    summary="Manage comments for a specific task",
)
class TaskCommentViewSet(ModelViewSet):
    """
    CRUD for Task Comments.
    Comments are nested under a specific ProjectStageElement (task).
    """
    serializer_class = TaskCommentSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        # Filter comments by the task_pk provided in the URL
        return TaskComment.objects.filter(task=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        # Automatically assign the task and user based on the context
        task = get_object_or_404(ProjectStageElement, pk=self.kwargs['task_pk'])
        serializer.save(task=task, user=self.request.user)

# ==========================================================
# FOLDER STRUCTURE TEMPLATE VIEWS
# ==========================================================

@extend_schema(

    tags=["Internal - Folder Structure Templates"],

    summary="Create & manage folder structure templates and generate project folders",

)

class FolderStructureTemplateViewSet(ModelViewSet):

    """

    CRUD for FolderStructureTemplate.

    - Allows creation, retrieval, update, and deletion of folder templates.

    - Provides an action to generate physical folder structures for projects.

    """

    queryset = FolderStructureTemplate.objects.all()

    serializer_class = FolderStructureTemplateSerializer

    permission_classes = [DjangoModelPermissionsWithView] # Or IsInternalUser as appropriate for your project



    @action(detail=True, methods=['post'], url_path='generate-structure')

    def generate_structure(self, request, pk=None):

        template = self.get_object()

        project_id = request.data.get('project_id')

        base_path = request.data.get('base_path') # e.g., '/mnt/projects' or comes from settings



        if not project_id or not base_path:

            return Response(

                {"detail": "project_id and base_path are required."},

                status=status.HTTP_400_BAD_REQUEST

            )



        try:

            project = Project.objects.get(pk=project_id)

        except Project.DoesNotExist:

            return Response(

                {"detail": f"Project with id {project_id} not found."},

                status=status.HTTP_404_NOT_FOUND

            )



        # Construct the full path for the new project

        # Example: base_path/ClientName/ProjectName

        # You'll need to adjust this based on your desired project path structure

        client_name = project.client.client_name.replace(" ", "_") # Assuming client has a name field

        project_name = project.name.replace(" ", "_")

        full_project_path = os.path.join(base_path, client_name, project_name)



        # Retrieve the structured data from the template

        folder_tree = template.structure



        # Use the utility function to create folders

        success = create_folders(full_project_path, folder_tree)



        if success:

            return Response(

                {"detail": f"Folder structure generated successfully at {full_project_path}"},

                status=status.HTTP_200_OK

            )

        else:

            return Response(

                {"detail": "Failed to generate folder structure."},

                status=status.HTTP_500_INTERNAL_SERVER_ERROR

            )



@extend_schema(
    tags=["Internal - Settings"],
    summary="Manage global storage settings",
)
class StorageSettingAPIView(APIView):
    """
    API for managing the single global StorageSetting instance.
    Supports GET (retrieve) and PATCH (partial update).
    Includes connection testing for NAS and S3.
    """
    permission_classes = [DjangoModelPermissionsWithView, IsInternalUser]

    def get(self, request):
        instance = StorageSetting.objects.get_singleton()
        serializer = StorageSettingSerializer(instance)
        return Response(serializer.data)

    def patch(self, request):
        instance = StorageSetting.objects.get_singleton()
        serializer = StorageSettingSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request):
        instance = StorageSetting.objects.get_singleton()
        serializer = StorageSettingSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='test-nas')
    def test_nas_connection(self, request):
        """
        Tests write permissions on the configured NAS path.
        """
        nas_path = request.data.get('nas_root_path')
        if not nas_path:
            return Response({"detail": "NAS path not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not os.path.exists(nas_path):
                return Response({
                    "status": "error",
                    "detail": f"Path does not exist: {nas_path}"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Try creating a temporary test file
            test_file = os.path.join(nas_path, '.connection_test')
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)

            return Response({
                "status": "success",
                "detail": "NAS connection and write test successful."
            })
        except Exception as e:
            return Response({
                "status": "error",
                "detail": f"NAS test failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='test-s3')
    def test_s3_connection(self, request):
        """
        Tests connectivity to the configured S3 bucket.
        """
        bucket_name = request.data.get('s3_bucket_name')
        region = request.data.get('s3_region')

        if not bucket_name:
            return Response({"detail": "S3 bucket name not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import boto3
            from botocore.exceptions import ClientError

            s3 = boto3.client('s3', region_name=region)
            s3.head_bucket(Bucket=bucket_name)

            return Response({
                "status": "success",
                "detail": f"Successfully connected to S3 bucket: {bucket_name}"
            })
        except ClientError as e:
            return Response({
                "status": "error",
                "detail": f"S3 test failed: {e.response['Error']['Message']}"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "status": "error",
                "detail": f"S3 test failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    # Note: Since this is an APIView, we need to manually dispatch the action-like methods 
    # or handle them in a custom dispatch. For simplicity, we'll route these via URL dispatch later
    # OR change this to a ViewSet with special list-mapping.
    # For now, let's keep it as APIView and add simple post handlers.

    def post(self, request, *args, **kwargs):
        action = request.query_params.get('action')
        if action == 'test-nas':
            return self.test_nas_connection(request)
        elif action == 'test-s3':
            return self.test_s3_connection(request)
        return Response({"detail": "Action not found."}, status=status.HTTP_404_NOT_FOUND)
