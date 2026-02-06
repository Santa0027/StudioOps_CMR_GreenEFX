from django.contrib import admin
from .models import (
    Project,
    ProjectStage,
    ProjectStageElement,
    ProjectStageTemplate,
    ProjectStageElementTemplate,
    ProjectTaskAssignment,
    StageElementVersion,
    ProjectTimeLog,
    ProjectAsset,
    ClientReviewLog,
    VersionAuditLog
)


# =====================================================
# INLINE ADMINS
# =====================================================

class ProjectStageElementInline(admin.TabularInline):
    model = ProjectStageElement
    extra = 0
    readonly_fields = ("order", "contribution_percentage", "status")
    show_change_link = True


class ProjectStageInline(admin.TabularInline):
    model = ProjectStage
    extra = 0
    show_change_link = True


class StageElementVersionInline(admin.TabularInline):
    model = StageElementVersion
    extra = 0
    readonly_fields = ("version_number", "created_by", "status", "created_at")


class ProjectAssetInline(admin.TabularInline):
    model = ProjectAsset
    extra = 0
    readonly_fields = ("version_number", "approved_at")


# =====================================================
# PROJECT ADMINS
# =====================================================

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "project_type", "service_type", "priority", "status", "start_date", "due_date")
    list_filter = ("status", "priority", "service_type", "project_type")
    search_fields = ("name", "client__name", "description")
    inlines = [ProjectStageInline]


@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = ("project", "template", "order", "status")
    list_filter = ("status", "template")
    search_fields = ("project__name", "template__name")
    inlines = [ProjectStageElementInline]


@admin.register(ProjectStageElement)
class ProjectStageElementAdmin(admin.ModelAdmin):
    list_display = ("stage", "template", "order", "status", "contribution_percentage")
    list_filter = ("status",)
    search_fields = ("stage__project__name", "template__name")


@admin.register(ProjectStageTemplate)
class ProjectStageTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


@admin.register(ProjectStageElementTemplate)
class ProjectStageElementTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "stage", "default_estimated_hours")
    list_filter = ("stage",)
    search_fields = ("name", "stage__name")


@admin.register(ProjectTaskAssignment)
class ProjectTaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ("task", "user", "role", "assigned_at")
    list_filter = ("role",)
    search_fields = ("task__template__name", "user__username")


@admin.register(StageElementVersion)
class StageElementVersionAdmin(admin.ModelAdmin):
    list_display = ("element", "version_number", "status", "created_by", "created_at")
    list_filter = ("status",)
    search_fields = ("element__template__name", "created_by__username")
    # Remove the ProjectAssetInline here



@admin.register(ProjectTimeLog)
class ProjectTimeLogAdmin(admin.ModelAdmin):
    list_display = ("task", "user", "hours_spent", "log_date")
    search_fields = ("task__template__name", "user__username")
    list_filter = ("log_date",)


@admin.register(ProjectAsset)
class ProjectAssetAdmin(admin.ModelAdmin):
    list_display = ("element", "asset_type", "asset_role", "uploaded_by", "storage_location", "client_review", "version_number")
    list_filter = ("asset_type", "asset_role", "storage_location", "client_review")
    search_fields = ("element__template__name", "uploaded_by__username")


@admin.register(ClientReviewLog)
class ClientReviewLogAdmin(admin.ModelAdmin):
    list_display = ("asset", "reviewed_by", "approved", "reviewed_at")
    list_filter = ("approved",)
    search_fields = ("asset__element__template__name", "reviewed_by__username")


@admin.register(VersionAuditLog)
class VersionAuditLogAdmin(admin.ModelAdmin):
    list_display = ("version", "action", "performed_by", "performed_at")
    list_filter = ("action",)
    search_fields = ("version__element__template__name", "performed_by__username")
   
# @admin.register(ProjectTaskAssignment)
# class PoojectTaskassignmentAdmin(admin.ModelAdmin):
#     list_display = ("task","user","initial_notes")    
