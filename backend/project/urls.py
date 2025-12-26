from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ProjectStageViewSet,
    ProjectStageElementViewSet,
    StageElementVersionViewSet,
    StageElementInputOutputViewSet
)

router = DefaultRouter()
router.register("projects", ProjectViewSet)
router.register("stages", ProjectStageViewSet)
router.register("tasks", ProjectStageElementViewSet)
router.register("versions", StageElementVersionViewSet)
router.register("io", StageElementInputOutputViewSet)

urlpatterns = router.urls
