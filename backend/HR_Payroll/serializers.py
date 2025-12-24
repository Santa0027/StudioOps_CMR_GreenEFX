from rest_framework import serializers
from django.contrib.auth.models import Group, Permission

from .models import (
    User,
    Employee,
    DepartmentOfStaff,
    Module,
    AuditLog,
)


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
            "user_permissions",
            "created_by",
            "created_at",
        )
        read_only_fields = ("created_by", "created_at")


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
