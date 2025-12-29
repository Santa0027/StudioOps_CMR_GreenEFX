"""
API URL Configuration for StudioOps Project Management System
=============================================================

This router exposes two main logical API groups:

1️⃣ INTERNAL APIs – used by studio team (admins, editors, designers, managers)
2️⃣ CLIENT APIs – used by clients only for review & approvals

All routes are version-ready and role-protected at the view level.
"""

from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import *

router = DefaultRouter()

# ==========================================================
# INTERNAL APIs (Studio / Team Access)
# ==========================================================

# Project CRUD
# - Create project (onboarding)
# - Update project details
# - Change status (in_progress, completed, etc.)
# - Used by Admin / Project Manager
router.register(
    "projects",
    ProjectViewSet,
    basename="projects"
)

# Project Stage Elements (Tasks inside stages)
# - View full task details
# - Track progress & contribution %
# - Internal rejection notes
# - Used by Editors / Designers / PMs
router.register(
    "stage-elements",
    ProjectStageElementViewSet,
    basename="stage-elements"
)

# Project Assets (Hybrid Storage)
# - Upload source files (PSD, AE, PR, etc.)
# - Upload preview & final renders
# - Manage local vs cloud assets
# - Used by Internal Team only
router.register(
    "assets",
    ProjectAssetViewSet,
    basename="assets"

)

# Stage Element Versions (Revision History)
# - Each internal or client-driven revision
# - Rollback support
# - Tracks hours spent per revision
router.register(
    "versions",
    StageElementVersionViewSet,
)

# Time Logs
# - Track working hours per task
# - Used for analytics, billing & payroll
router.register(
    "time-logs",
    ProjectTimeLogViewSet,
)

# ==========================================================
# CLIENT APIs (Client Portal / Review Access)
# ==========================================================

# Client-visible Assets
# - Only cloud-stored assets
# - Only client_review=True
# - No source files exposed
# - Used in Client Dashboard
router.register(
    "client/assets",
    ClientProjectAssetViewSet,
    basename="client-assets",
)

# Client-visible Stage Elements
# - Shows task status
# - Shows rejection notes
# - Shows client-approved assets only
router.register(
    "client/stage-elements",
    ClientProjectStageElementViewSet,
    basename="client-stage-elements",
)

# Client Review Logs
# - Client approval / rejection
# - Review notes
# - Drives next internal revision
router.register(
    "client/reviews",
    ClientReviewLogViewSet,
    basename="client-reviews",
)




# ==========================================================
# FINAL URL PATTERNS
# ==========================================================

# Automatically generates RESTful routes like:
# GET /api/projects/
# POST /api/assets/
# GET /api/client/assets/
# All CRUD and ReadOnly routes based on viewsets
urlpatterns = router.urls
urlpatterns += [
    path("client/assets/<int:asset_id>/stream/", AssetStreamView.as_view(), name="asset-stream"),
]