from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,

    ProjectStageTemplateViewSet,
    ProjectStageElementTemplateViewSet,

    ProjectStageViewSet,
    ProjectStageElementViewSet,

    ProjectTaskAssignmentViewSet,

    StageElementVersionViewSet,

    ProjectTimeLogViewSet,
    ProjectAttachmentViewSet,
)

router = DefaultRouter()

# ============================
# CORE PROJECT
# ============================
router.register(r"projects", ProjectViewSet, basename="project")

# ============================
# WORKFLOW TEMPLATES (GLOBAL)
# ============================
router.register(
    r"workflow/stage-templates",
    ProjectStageTemplateViewSet,
    basename="stage-template"
)

router.register(
    r"workflow/task-templates",
    ProjectStageElementTemplateViewSet,
    basename="task-template"
)

# ============================
# PROJECT WORKFLOW (PER PROJECT)
# ============================
router.register(
    r"project-stages",
    ProjectStageViewSet,
    basename="project-stage"
)

router.register(
    r"project-stage-elements",
    ProjectStageElementViewSet,
    basename="project-stage-element"
)

# ============================
# ASSIGNMENTS
# ============================
router.register(
    r"task-assignments",
    ProjectTaskAssignmentViewSet,
    basename="task-assignment"
)

# ============================
# VERSIONING
# ============================
router.register(
    r"task-versions",
    StageElementVersionViewSet,
    basename="task-version"
)

# ============================
# TIME LOGS
# ============================
router.register(
    r"time-logs",
    ProjectTimeLogViewSet,
    basename="time-log"
)

# ============================
# ATTACHMENTS
# ============================
router.register(
    r"project-attachments",
    ProjectAttachmentViewSet,
    basename="project-attachment"
)

urlpatterns = [
    path("", include(router.urls)),
]
