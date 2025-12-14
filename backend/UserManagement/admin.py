from django.contrib import admin
from .models import (
    User,
    Role,
    Module,
    RolePermission,
    DepartmentOfStaff,
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


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "module", "action", "allowed")
    list_filter = ("role", "module", "action", "allowed")
    list_editable = ("allowed",)
    search_fields = ("role__name", "module__name")


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "role", "department", "is_active")
    list_filter = ("role", "department", "is_active")
    search_fields = ("email", "name", "phone")
    ordering = ("-date_joined",)
