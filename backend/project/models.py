from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum, Max
from HR_Payroll.models import User
from Sales.models import Clients


# =====================================================
# PROJECT
# =====================================================

class Project(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
        ("cancelled", "Cancelled"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    SERVICE_TYPE_CHOICES = [
        ("3d_animation", "3D Animation"),
        ("graphic_design", "Graphic Design"),
        ("video_editing", "Video Editing"),
        ("motion_graphics", "Motion Graphics"),
        ("vfx", "VFX"),
        ("package", "Package"),
    ]

    PROJECT_TYPE_CHOICES = [
        ("package", "Package"),
        ("single_service", "Single Service"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="None")

    client = models.ForeignKey(
        Clients,
        on_delete=models.PROTECT,
        related_name="projects"
    )

    project_type = models.CharField(
        max_length=20,
        choices=PROJECT_TYPE_CHOICES,
        default="single_service"
    )

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPE_CHOICES,
        default="graphic_design"
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="not_started"
    )

    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)

    initial_requirements = models.TextField(blank=True)
    reference_links = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_projects",
        null=True,
        blank=True
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="updated_projects",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# =====================================================
# WORKFLOW TEMPLATES (GLOBAL)
# =====================================================

class ProjectStageTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class ProjectStageElementTemplate(models.Model):
    stage = models.ForeignKey(
        ProjectStageTemplate,
        on_delete=models.CASCADE,
        related_name="task_templates"
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    default_estimated_hours = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("stage", "name")

    def __str__(self):
        return f"{self.stage.name} → {self.name}"


# =====================================================
# PROJECT INSTANCES
# =====================================================

class ProjectStage(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="stages"
    )

    template = models.ForeignKey(
        ProjectStageTemplate,
        on_delete=models.PROTECT
    )

    order = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("active", "Active"),
            ("completed", "Completed"),
            ("rejected", "Rejected"),
        ],
        default="pending"
    )

    rejection_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]
        unique_together = ("project", "template")

    def __str__(self):
        return f"{self.project.name} → {self.template.name}"


class ProjectStageElement(models.Model):
    stage = models.ForeignKey(
        ProjectStage,
        on_delete=models.CASCADE,
        related_name="elements"
    )

    template = models.ForeignKey(
        ProjectStageElementTemplate,
        on_delete=models.PROTECT
    )

    order = models.PositiveIntegerField(default=0)

    contribution_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("rejected", "Rejected"),
        ],
        default="pending"
    )

    rejection_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]
        unique_together = ("stage", "template")

    def clean(self):
        if not (0 < self.contribution_percentage <= 100):
            raise ValidationError("Contribution must be between 0 and 100")

        total = ProjectStageElement.objects.filter(
            stage=self.stage
        ).exclude(pk=self.pk).aggregate(
            total=Sum("contribution_percentage")
        )["total"] or 0

        if total + self.contribution_percentage > 100:
            raise ValidationError(
                "Total contribution of all stage elements cannot exceed 100%"
            )

    def __str__(self):
        return f"{self.stage} → {self.template.name}"


# =====================================================
# TASK ASSIGNMENTS
# =====================================================

class ProjectTaskAssignment(models.Model):
    task = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="task_assignments"
    )

    role = models.CharField(max_length=100)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "user", "role")


# =====================================================
# VERSIONING (INTERNAL & CLIENT)
# =====================================================

class StageElementVersion(models.Model):
    element = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="versions"
    )

    version_number = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="stage_element_versions/")
    hours_spent = models.DecimalField(max_digits=6, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending"
    )

    rejection_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    rollback_to = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("element", "version_number")
        ordering = ["-version_number"]


# =====================================================
# TIME LOGS
# =====================================================

class ProjectTimeLog(models.Model):
    task = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="time_logs"
    )

    user = models.ForeignKey(User, on_delete=models.PROTECT)
    hours_spent = models.DecimalField(max_digits=5, decimal_places=2)
    log_date = models.DateField(auto_now_add=True)
    note = models.TextField(blank=True)


# =====================================================
# PROJECT ASSETS (HYBRID STORAGE)
# =====================================================

class ProjectAsset(models.Model):
    
    
    def project_asset_upload_path(instance, filename):
        project_name = instance.element.stage.project.name.replace(" ", "_")
        stage_name = instance.element.stage.template.name.replace(" ", "_")
        role = instance.asset_role.lower()
        
        # Optional: sanitize filename
        filename = filename.replace(" ", "_")
        
        return f"{project_name}/{stage_name}/{role}/{filename}"
    ASSET_TYPE_CHOICES = [
        ("psd", "Photoshop"),
        ("ai", "Illustrator"),
        ("ae", "After Effects"),
        ("pr", "Premiere Pro"),
        ("video", "Video"),
        ("image", "Image"),
        ("other", "Other"),
    ]

    STORAGE_LOCATION_CHOICES = [
        ("local", "Local Server"),
        ("cloud", "Cloud Server"),
    ]

    ASSET_ROLE_CHOICES = [
        ("source", "Source File"),
        ("preview", "Preview Render"),
        ("final", "Final Deliverable"),
    ]

    element = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="assets"
    )

    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    asset_role = models.CharField(max_length=20, choices=ASSET_ROLE_CHOICES)
    file = models.FileField(upload_to=project_asset_upload_path)
    storage_location = models.CharField(
        max_length=10,
        choices=STORAGE_LOCATION_CHOICES,
        default="local"
    )

    client_review = models.BooleanField(default=False)
    version_number = models.PositiveIntegerField(editable=False)
    description = models.TextField(blank=True)
    processed = models.BooleanField(default=False)  # Added for Celery task tracking

    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("element", "version_number", "client_review")
        ordering = ["-version_number"]

    def save(self, *args, **kwargs):
        if not self.pk:
            last_version = ProjectAsset.objects.filter(
                element=self.element,
                client_review=self.client_review
            ).aggregate(
                max_v=Max("version_number")
            )["max_v"] or 0

            self.version_number = last_version + 1

        super().save(*args, **kwargs)
        
    def project_asset_upload_path(instance, filename):
        project_name = instance.element.stage.project.name.replace(" ", "_")
        stage_name = instance.element.stage.template.name.replace(" ", "_")
        role = instance.asset_role.lower()
        
        # Optional: sanitize filename
        filename = filename.replace(" ", "_")
        
        return f"{project_name}/{stage_name}/{role}/{filename}"

    


# =====================================================
# CLIENT REVIEW LOG
# =====================================================

class ClientReviewLog(models.Model):
    asset = models.ForeignKey(
        ProjectAsset,
        on_delete=models.CASCADE,
        related_name="review_logs"
    )

    reviewed_by = models.ForeignKey(User, on_delete=models.PROTECT)
    review_notes = models.TextField(blank=True)
    approved = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(auto_now_add=True)



class VersionAuditLog(models.Model):
    version = models.ForeignKey(
        StageElementVersion,
        on_delete=models.CASCADE,
        related_name="audit_logs"
    )

    action = models.CharField(
        max_length=20,
        choices=[
            ("approved", "Approved"),
            ("rejected", "Rejected"),
            ("rolled_back", "Rolled Back"),
        ]
    )

    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.PROTECT)
    performed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.version} - {self.action}"

# =====================================================
# PACKAGES
# =====================================================

class Package(models.Model):
    FREQUENCY_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("one_time", "One-time"),
    ]

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default="one_time"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PackageItem(models.Model):
    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name="items"
    )
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50, blank=True) # e.g., "count", "pages", "hours"

    class Meta:
        unique_together = ("package", "name")

    def __str__(self):
        return f"{self.quantity} {self.unit} {self.name} for {self.package.name}"