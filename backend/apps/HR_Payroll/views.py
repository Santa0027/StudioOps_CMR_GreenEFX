from rest_framework import viewsets, permissions
from django.contrib.auth.models import Group , Permission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import User, Employee, DepartmentOfStaff, Module, AuditLog,EmpAttendance,Payroll,Payslip,SalaryStructure
from .serializers import (
    UserSerializer,
    EmployeeSerializer,
    DepartmentSerializer,
    ModuleSerializer,
    GroupSerializer,
    AuditLogSerializer,PermissionSerializer,AttendanceSerializer,PayrollSerializer,SalaryStructureSerializer
)

from .services.payroll import calculate_payroll 

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


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmpAttendance.objects.select_related("employee", "employee__user")
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAdminUser]


class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.select_related("employee")
    serializer_class = SalaryStructureSerializer
    permission_classes = [permissions.IsAdminUser]


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=["post"], url_path="generate")
    def generate_payroll(self, request):
        employee_id = request.data.get("employee_id")
        month = request.data.get("month")
        year = request.data.get("year")

        employee = Employee.objects.get(id=employee_id)

        payroll = calculate_payroll(
            employee=employee,
            month=month,
            year=year,
            admin_user=request.user
        )

        return Response(
            {"message": "Payroll generated", "payroll_id": payroll.id},
            status=status.HTTP_201_CREATED
        )