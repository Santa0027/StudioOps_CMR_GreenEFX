from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.select_related("client", "created_by")
    serializer_class = ProjectSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
class ProjectStageTemplateViewSet(ModelViewSet):
    queryset = ProjectStageTemplate.objects.all()
    serializer_class = ProjectStageTemplateSerializer
    permission_classes = [IsAuthenticated]


class ProjectStageElementTemplateViewSet(ModelViewSet):
    queryset = ProjectStageElementTemplate.objects.select_related("stage")
    serializer_class = ProjectStageElementTemplateSerializer
    permission_classes = [IsAuthenticated]
class ProjectStageViewSet(ModelViewSet):
    queryset = ProjectStage.objects.select_related("project", "template")
    serializer_class = ProjectStageSerializer
    permission_classes = [IsAuthenticated]
class ProjectStageElementViewSet(ModelViewSet):
    queryset = ProjectStageElement.objects.select_related(
        "stage", "template"
    )
    serializer_class = ProjectStageElementSerializer
    permission_classes = [IsAuthenticated]
class ProjectTaskAssignmentViewSet(ModelViewSet):
    queryset = ProjectTaskAssignment.objects.select_related("task", "user")
    serializer_class = ProjectTaskAssignmentSerializer
    permission_classes = [IsAuthenticated]
class StageElementVersionViewSet(ModelViewSet):
    queryset = StageElementVersion.objects.select_related("element", "created_by")
    serializer_class = StageElementVersionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        element = serializer.validated_data["element"]
        last_version = (
            StageElementVersion.objects
            .filter(element=element)
            .order_by("-version_number")
            .first()
        )
        next_version = 1 if not last_version else last_version.version_number + 1

        serializer.save(
            version_number=next_version,
            created_by=self.request.user
        )
class ProjectTimeLogViewSet(ModelViewSet):
    queryset = ProjectTimeLog.objects.select_related("task", "user")
    serializer_class = ProjectTimeLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class ProjectAttachmentViewSet(ModelViewSet):
    queryset = ProjectAttachment.objects.select_related("project")
    serializer_class = ProjectAttachmentSerializer
    permission_classes = [IsAuthenticated]
