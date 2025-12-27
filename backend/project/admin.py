from django.contrib import admin

from .models import (
    Project,
    ProjectStageTemplate,
    ProjectStageElementTemplate,
    ProjectStage,
    ProjectStageElement,
    ProjectTaskAssignment,
    StageElementVersion,
    ProjectTimeLog,
    ProjectAttachment,
)

# =====================================================
# INLINE CONFIGURATIONS
# =====================================================

class ProjectAttachmentInline(admin.TabularInline):
    model = ProjectAttachment
    extra = 0


class ProjectStageInline(admin.TabularInline):
    model = ProjectStage
    extra = 0
    fields = ("template", "order", "status")
    readonly_fields = ("status",)


class ProjectStageElementInline(admin.TabularInline):
    model = ProjectStageElement
    extra = 0
    fields = (
        "template",
        "order",
        "contribution_percentage",
        "estimated_hours",
        "status",
    )
    readonly_fields = ("status",)


class TaskAssignmentInline(admin.TabularInline):
    model = ProjectTaskAssignment
    extra = 0


class StageElementVersionInline(admin.TabularInline):
    model = StageElementVersion
    extra = 0
    readonly_fields = (
        "version_number",
        "created_by",
        "created_at",
    )


class ProjectTimeLogInline(admin.TabularInline):
    model = ProjectTimeLog
    extra = 0
    readonly_fields = ("log_date",)


# =====================================================
# TEMPLATE ADMINS (GLOBAL WORKFLOW)
# =====================================================

@admin.register(ProjectStageTemplate)
class ProjectStageTemplateAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(ProjectStageElementTemplate)
class ProjectStageElementTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "stage", "default_estimated_hours")
    list_filter = ("stage",)
    search_fields = ("name",)


# =====================================================
# PROJECT ADMIN
# =====================================================

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "client",
        "service_type",
        "priority",
        "status",
        "start_date",
        "due_date",
    )

    list_filter = (
        "status",
        "priority",
        "service_type",
        "project_type",
    )

    search_fields = (
        "name",
        "client__name",
    )

    inlines = [
        ProjectAttachmentInline,
        ProjectStageInline,
    ]

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "name",
                "description",
                "client",
                "project_type",
                "service_type",
                "priority",
                "status",
            )
        }),
        ("Timeline", {
            "fields": (
                "start_date",
                "due_date",
                "end_date",
            )
        }),
        ("Estimation", {
            "fields": (
                "budget",
                "estimated_hours",
            )
        }),
        ("Metadata", {
            "fields": (
                "initial_requirements",
                "reference_links",
                "created_by",
                "updated_by",
            )
        }),
        ("System", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )


# =====================================================
# PROJECT STAGE ADMIN
# =====================================================

@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = (
        "project",
        "template",
        "order",
        "status",
    )

    list_filter = ("status",)
    search_fields = ("project__name", "template__name")

    inlines = [ProjectStageElementInline]


# =====================================================
# PROJECT TASK (STAGE ELEMENT)
# =====================================================

@admin.register(ProjectStageElement)
class ProjectStageElementAdmin(admin.ModelAdmin):
    list_display = (
        "template",
        "stage",
        "contribution_percentage",
        "status",
    )

    list_filter = ("status",)
    search_fields = (
        "template__name",
        "stage__project__name",
    )

    inlines = [
        TaskAssignmentInline,
        StageElementVersionInline,
        ProjectTimeLogInline,
    ]


# =====================================================
# VERSION ADMIN
# =====================================================

@admin.register(StageElementVersion)
class StageElementVersionAdmin(admin.ModelAdmin):
    list_display = (
        "element",
        "version_number",
        "status",
        "created_by",
        "created_at",
    )

    list_filter = ("status",)
    search_fields = ("element__template__name",)
    readonly_fields = ("created_at",)


# =====================================================
# ASSIGNMENT ADMIN
# =====================================================

@admin.register(ProjectTaskAssignment)
class ProjectTaskAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "task",
        "user",
        "role",
        "assigned_at",
    )

    search_fields = (
        "task__template__name",
        "user__username",
    )


# =====================================================
# TIME LOG ADMIN
# =====================================================

@admin.register(ProjectTimeLog)
class ProjectTimeLogAdmin(admin.ModelAdmin):
    list_display = (
        "task",
        "user",
        "hours_spent",
        "log_date",
    )

    list_filter = ("log_date",)
    search_fields = (
        "task__template__name",
        "user__username",
    )
