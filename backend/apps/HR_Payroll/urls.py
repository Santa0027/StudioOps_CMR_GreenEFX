from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views_auth import RegisterView, LoginView
from .views import (
    UserViewSet,
    EmployeeViewSet,
    DepartmentViewSet,
    ModuleViewSet,
    RoleViewSet,
    AuditLogViewSet,PermissionViewSet
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"modules", ModuleViewSet, basename="module")
router.register("permissions", PermissionViewSet)
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-log")

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API
    path("", include(router.urls)),
]
