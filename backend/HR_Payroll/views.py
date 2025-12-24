from rest_framework import viewsets, permissions
from django.contrib.auth.models import Group , Permission

from .models import User, Employee, DepartmentOfStaff, Module, AuditLog
from .serializers import (
    UserSerializer,
    EmployeeSerializer,
    DepartmentSerializer,
    ModuleSerializer,
    GroupSerializer,
    AuditLogSerializer,PermissionSerializer
)
 

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by("id")
    serializer_class = PermissionSerializer
    
    
    

class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    # permission_classes = [IsAdminOrSelf]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "department", "role")
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAdminUser]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = DepartmentOfStaff.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related("permissions")
    serializer_class = GroupSerializer
    # permission_classes = [permissions.IsAdminUser]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("performed_by")
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
