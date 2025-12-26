from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Project, ProjectStage, ProjectStageElement,
    StageElementVersion, StageElementInputOutput
)
# from .serializers import (
#     ProjectSerializer, ProjectStageSerializer,
#     ProjectStageElementSerializer, StageElementVersionSerializer,
#     StageElementInputOutputSerializer
# )


from .serializers import(
    ProjectSerializer, ProjectStageSerializer,
     ProjectStageElementSerializer, StageElementVersionSerializer,
      StageElementInputOutputSerializer
)



# ---------------------------
# Project
# ---------------------------
class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


# ---------------------------
# Stage
# ---------------------------
class ProjectStageViewSet(ModelViewSet):
    queryset = ProjectStage.objects.all()
    serializer_class = ProjectStageSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        stage = self.get_object()
        stage.status = "completed"
        stage.save()
        return Response({"message": "Stage approved"})


# ---------------------------
# Task / Stage Element
# ---------------------------
class ProjectStageElementViewSet(ModelViewSet):
    queryset = ProjectStageElement.objects.all()
    serializer_class = ProjectStageElementSerializer

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        element = self.get_object()
        element.status = "rejected"
        element.rejection_notes = request.data.get("notes", "")
        element.save()
        return Response({"message": "Task rejected"})


# ---------------------------
# Versioning
# ---------------------------
class StageElementVersionViewSet(ModelViewSet):
    queryset = StageElementVersion.objects.all()
    serializer_class = StageElementVersionSerializer

    @action(detail=True, methods=["post"])
    def rollback(self, request, pk=None):
        version = self.get_object()
        target_version_id = request.data.get("rollback_to")

        try:
            target = StageElementVersion.objects.get(id=target_version_id)
        except StageElementVersion.DoesNotExist:
            return Response(
                {"error": "Invalid version"},
                status=status.HTTP_400_BAD_REQUEST
            )

        version.rollback_to = target
        version.save()

        return Response({
            "message": f"Rolled back to version {target.version_number}"
        })


# ---------------------------
# Inputs / Outputs
# ---------------------------
class StageElementInputOutputViewSet(ModelViewSet):
    queryset = StageElementInputOutput.objects.all()
    serializer_class = StageElementInputOutputSerializer
