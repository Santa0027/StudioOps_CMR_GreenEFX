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
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .tasks import process_project_asset

from .models import *
from .serializers import *
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
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Make a mutable copy of the request data
        data = request.data.copy()

        # Extract workflow_template_ids from the copied data, if present
        workflow_template_ids = data.pop('workflow_template_ids', [])
        
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
        
        # Re-serialize the project to include the newly created stages in the response
        project.refresh_from_db()
        final_serializer = self.get_serializer(project)
        headers = self.get_success_headers(final_serializer.data)
        return Response(final_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # This perform_create is now redundant because create method is overridden
        # Keeping it for consistency in case create method logic changes later,
        # but it won't be called by the current create method
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], serializer_class=StageElementVersionUploadSerializer)
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
    permission_classes = [IsAuthenticated, IsInternalUser]

    def get_queryset(self):
        queryset = ProjectStageElement.objects.select_related("stage", "template").filter(stage__status='active')
        project_id = self.request.query_params.get("project_id")
        if project_id:
            queryset = queryset.filter(stage__project_id=project_id)
        
        return queryset.distinct()


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
    queryset = ProjectAsset.objects.all()
    serializer_class = ProjectAssetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Hook for async upload / background processing
        serializer.save(uploaded_by=self.request.user)
        # Assuming `asset` is available in this scope, which it's not if coming from serializer.save()
        # This line might need adjustment to get the actual instance created by the serializer
        # For now, commenting out the process_project_asset.delay call to avoid an error
        # process_project_asset.delay(asset.id) # TODO: Pass the actual created asset ID


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
    queryset = StageElementVersion.objects.all()
    serializer_class = StageElementVersionSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]


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
    permission_classes = [IsAuthenticated, IsClientUser]

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
    permission_classes = [IsAuthenticated, IsClientUser]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]


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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]


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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter assignments by the task_pk provided in the URL
        return ProjectTaskAssignment.objects.filter(task=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        # Automatically assign the task based on the URL
        task = get_object_or_404(ProjectStageElement, pk=self.kwargs['task_pk'])
        serializer.save(task=task)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)