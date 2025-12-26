from django.contrib import admin
from .models import (
    Project,
    Package,
    ProjectPackage,
    ProjectStage,
    ProjectStageElement,
    StageElementVersion,
    ArtistContribution,
    ProjectAttachment,
    ProjectTimeLog,
    StageElementInputOutput
)

# -------------------------------
# Inline Admins
# -------------------------------
class ProjectPackageInline(admin.TabularInline):
    model = ProjectPackage
    extra = 1

class ProjectStageInline(admin.TabularInline):
    model = ProjectStage
    extra = 1
    fields = ("name", "order", "status", "rejection_notes")
    readonly_fields = ("rejection_notes",)

class ProjectStageElementInline(admin.TabularInline):
    model = ProjectStageElement
    extra = 1
    fields = ("name", "order", "assigned_to", "status", "estimated_hours", "actual_hours", "rejection_notes")
    readonly_fields = ("rejection_notes",)

class StageElementVersionInline(admin.TabularInline):
    model = StageElementVersion
    extra = 0
    fields = ("version_number", "file", "status", "created_by", "rollback_to", "rejection_notes")
    readonly_fields = ("rejection_notes",)

class ProjectAttachmentInline(admin.TabularInline):
    model = ProjectAttachment
    extra = 1

class ProjectTimeLogInline(admin.TabularInline):
    model = ProjectTimeLog
    extra = 1

class StageElementInputOutputInline(admin.TabularInline):
    model = StageElementInputOutput
    extra = 1
    readonly_fields = ("created_at",)

class ArtistContributionInline(admin.TabularInline):
    model = ArtistContribution
    extra = 1

# -------------------------------
# Main Admins
# -------------------------------
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "project_type", "service_type", "priority", "status", "start_date", "due_date")
    list_filter = ("status", "priority", "service_type", "project_type")
    search_fields = ("name", "client__name", "created_by__name")
    inlines = [
        ProjectPackageInline,
        ProjectStageInline,
        ProjectAttachmentInline,
        ArtistContributionInline
    ]


@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "order", "status")
    list_filter = ("status",)
    search_fields = ("name", "project__name")
    inlines = [ProjectStageElementInline]


@admin.register(ProjectStageElement)
class ProjectStageElementAdmin(admin.ModelAdmin):
    list_display = ("name", "stage", "order", "assigned_to", "status", "estimated_hours", "actual_hours")
    list_filter = ("status",)
    search_fields = ("name", "stage__name", "assigned_to__name")
    inlines = [StageElementVersionInline, ProjectTimeLogInline]


@admin.register(StageElementVersion)
class StageElementVersionAdmin(admin.ModelAdmin):
    list_display = ("element", "version_number", "status", "created_by", "created_at", "rollback_to")
    list_filter = ("status",)
    search_fields = ("element__name", "created_by__name")
    readonly_fields = ("rollback_to", "rejection_notes")
    inlines = [StageElementInputOutputInline]


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("name", "price")
    search_fields = ("name",)


@admin.register(ArtistContribution)
class ArtistContributionAdmin(admin.ModelAdmin):
    list_display = ("project", "artist", "role", "percentage")
    search_fields = ("project__name", "artist__name")
    raw_id_fields = ("project", "artist")


@admin.register(ProjectAttachment)
class ProjectAttachmentAdmin(admin.ModelAdmin):
    list_display = ("project", "file", "uploaded_at")
    search_fields = ("project__name",)


@admin.register(ProjectTimeLog)
class ProjectTimeLogAdmin(admin.ModelAdmin):
    list_display = ("task", "user", "hours_spent", "log_date")
    search_fields = ("task__name", "user__name")


@admin.register(StageElementInputOutput)
class StageElementInputOutputAdmin(admin.ModelAdmin):
    list_display = ("element_version", "input_type", "created_by", "created_at")
    list_filter = ("input_type",)
    search_fields = ("element_version__element__name", "created_by__name")
