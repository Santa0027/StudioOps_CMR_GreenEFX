from django.contrib import admin
from .models import (
    Project,
    Package,
    ProjectStage,
    ProjectStageElement,
    ArtistContribution,
)

# --------------------------------------------------
# Project Stage Element Inline (Child of ProjectStage)
# --------------------------------------------------
class ProjectStageElementInline(admin.TabularInline):
    model = ProjectStageElement
    extra = 1
    fields = ("name", "order", "status", "description")
    ordering = ("order",)
    show_change_link = True


# --------------------------------------------------
# Project Stage Inline (Child of Project)
# --------------------------------------------------
class ProjectStageInline(admin.TabularInline):
    model = ProjectStage
    extra = 1
    fields = ("name", "order", "status", "description")
    ordering = ("order",)
    show_change_link = True


# --------------------------------------------------
# Project Admin
# --------------------------------------------------
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "client",
        "assigned_to",
        "status",
        "start_date",
        "due_date",
        "budget",
    )
    list_filter = ("status", "client")
    search_fields = ("name", "client__name")
    ordering = ("-created_at",)
    inlines = [ProjectStageInline]


# --------------------------------------------------
# Project Stage Admin
# --------------------------------------------------
@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "order", "status")
    list_filter = ("project", "status")
    ordering = ("project", "order")
    inlines = [ProjectStageElementInline]


# --------------------------------------------------
# Package Admin
# --------------------------------------------------
@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "created_at")
    search_fields = ("name",)


# --------------------------------------------------
# Artist Contribution Admin
# --------------------------------------------------
@admin.register(ArtistContribution)
class ArtistContributionAdmin(admin.ModelAdmin):
    list_display = ("artist", "project", "percentage", "role")
    list_filter = ("project",)
    search_fields = ("artist__name", "project__name")
