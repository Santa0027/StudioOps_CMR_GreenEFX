from django.contrib import admin
from .models import (
    User,
    Role,
    Module,
    RolePermission,
    DepartmentOfStaff,
    PermissionAction,
    AuditLog,
)


@admin.register(DepartmentOfStaff)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(PermissionAction)
class PermissionActionAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "module", "allowed", "display_actions")
    list_filter = ("role", "module", "allowed")
    filter_horizontal = ("actions",)
    search_fields = ("role__name", "module__name")

    def display_actions(self, obj):
        return ", ".join(action.name for action in obj.actions.all())

    display_actions.short_description = "Actions"



@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "role", "department", "is_active")
    list_filter = ("role", "department", "is_active")
    search_fields = ("email", "name", "phone")
    ordering = ("-date_joined",)




@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "entity_type",
        "entity_name",
        "action",
        "performed_by",
        "performed_at",
    )
    list_filter = ("entity_type", "action", "performed_at")
    search_fields = ("entity_name", "performed_by__email")
    readonly_fields = [field.name for field in AuditLog._meta.fields]
    ordering = ("-performed_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False