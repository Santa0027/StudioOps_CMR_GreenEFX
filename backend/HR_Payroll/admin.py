from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from .models import (
    User,
    Employee,
    DepartmentOfStaff,
    Module,
    AuditLog,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    list_display = ("email", "name", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "phone")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Audit", {"fields": ("created_by", "created_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "department")
    list_filter = ("role", "department")
    search_fields = ("user__email", "user__name")


@admin.register(DepartmentOfStaff)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by", "created_at")
    search_fields = ("name",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "created_by", "created_at")
    search_fields = ("code", "name")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "entity_name",
        "entity_type",
        "action",
        "performed_by",
        "performed_at",
    )
    list_filter = ("action", "entity_type")
    readonly_fields = (
        "entity_type",
        "entity_id",
        "entity_name",
        "action",
        "old_data",
        "new_data",
        "performed_by",
        "performed_at",
        "ip_address",
    )


admin.site.unregister(Group)
admin.site.register(Group)
