from rest_framework import serializers
from django.contrib.auth.models import Group, Permission

from .models import (
    User,
    Employee,
    DepartmentOfStaff,
    Module,
    AuditLog,
    SalaryStructure,
    Payroll,
    Payslip,
    EmpAttendance,
)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['is_staff'] = user.is_staff
        token['groups'] = list(user.groups.values_list('name', flat=True))
        token['name'] = user.name
        return token

# ---------- Permissions & Roles ----------

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "name")


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )

    class Meta:
        model = Group
        fields = ("id", "name", "permissions")

    def create(self, validated_data):
        permissions = validated_data.pop("permissions", [])
        group = Group.objects.create(**validated_data)
        if permissions:
            group.permissions.set(permissions)
        return group

    def update(self, instance, validated_data):
        permissions = validated_data.pop("permissions", None)
        instance = super().update(instance, validated_data)
        if permissions is not None:
            instance.permissions.set(permissions)
        return instance



# ---------- Core Models ----------

class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    user_permissions = PermissionSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Group.objects.all(), 
        write_only=True, 
        required=False,
        source='groups'
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "phone",
            "is_active",
            "is_staff",
            "groups",
            "group_ids",
            "user_permissions",
            "created_by",
            "created_at",
            "password",
        )
        read_only_fields = ("created_by", "created_at")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        groups = validated_data.pop("groups", [])
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        if groups:
            user.groups.set(groups)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        groups = validated_data.pop("groups", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        if groups is not None:
            user.groups.set(groups)
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentOfStaff
        fields = "__all__"


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = serializers.StringRelatedField()
    department = serializers.StringRelatedField()

    class Meta:
        model = Employee
        fields = "__all__"


class AuditLogSerializer(serializers.ModelSerializer):
    performed_by = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = "__all__"



class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)

    class Meta:
        model = EmpAttendance
        fields = (
            "id",
            "employee",
            "employee_name",
            "employee_code",
            "date",
            "status",
            "check_in",
            "check_out",
        )


class SalaryStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryStructure
        fields = "__all__"


class PayrollSerializer(serializers.ModelSerializer):
    employee_email = serializers.EmailField(
        source="employee.user.email", read_only=True
    )

    class Meta:
        model = Payroll
        fields = "__all__"
