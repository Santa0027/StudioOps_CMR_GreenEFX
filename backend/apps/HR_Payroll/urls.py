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
    AuditLogViewSet,
    PermissionViewSet,
    AttendanceViewSet,
    PayrollViewSet,
    SalaryStructureViewSet
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"modules", ModuleViewSet, basename="module")
router.register(r"permissions", PermissionViewSet, basename="permission")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-log")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"payroll", PayrollViewSet, basename="payroll")
router.register(r"salary-structures", SalaryStructureViewSet, basename="salary-structure")

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API
    path("", include(router.urls)),
]
