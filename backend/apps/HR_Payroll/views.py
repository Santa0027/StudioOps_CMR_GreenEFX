from rest_framework import viewsets, permissions
from django.contrib.auth.models import Group , Permission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from common.permissions.model_permissions import DjangoModelPermissionsWithView

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
    permission_classes = [permissions.IsAdminUser]
    
    
    

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
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "department", "role")
    serializer_class = EmployeeSerializer
    permission_classes = [DjangoModelPermissionsWithView]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = DepartmentOfStaff.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related("permissions")
    serializer_class = GroupSerializer
    permission_classes = [DjangoModelPermissionsWithView]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("performed_by")
    serializer_class = AuditLogSerializer
    permission_classes = [DjangoModelPermissionsWithView]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmpAttendance.objects.select_related("employee", "employee__user")
    serializer_class = AttendanceSerializer
    permission_classes = [DjangoModelPermissionsWithView]

    def get_queryset(self):
        queryset = EmpAttendance.objects.select_related("employee", "employee__user")
        user = self.request.user
        
        # If not staff, only see own attendance
        if not user.is_staff:
            queryset = queryset.filter(employee__user=user)
            
        date = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        status = self.request.query_params.get('status')

        if date:
            queryset = queryset.filter(date=date)
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        user = request.user
        try:
            employee = user.employee_profile
        except Employee.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        now_time = timezone.now().time()

        attendance, created = EmpAttendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'status': 'PRESENT', 'check_in': now_time}
        )

        if not created:
            if attendance.check_in:
                return Response({"detail": "Already checked in today."}, status=status.HTTP_400_BAD_REQUEST)
            attendance.check_in = now_time
            attendance.status = 'PRESENT'
            attendance.save()

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-out')
    def check_out(self, request):
        user = request.user
        try:
            employee = user.employee_profile
        except Employee.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        now_time = timezone.now().time()

        try:
            attendance = EmpAttendance.objects.get(employee=employee, date=today)
        except EmpAttendance.DoesNotExist:
            return Response({"detail": "No check-in record found for today."}, status=status.HTTP_400_BAD_REQUEST)

        attendance.check_out = now_time
        attendance.save()

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)


class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.select_related("employee")
    serializer_class = SalaryStructureSerializer
    permission_classes = [DjangoModelPermissionsWithView]


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [DjangoModelPermissionsWithView]

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
