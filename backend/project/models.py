from django.db import models
from django.core.exceptions import ValidationError
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
    """
    Example: Pre-Production, Editing, Effects
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class ProjectStageElementTemplate(models.Model):
    """
    Example: Script Writing, Requirement Gathering
    """
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
# PROJECT INSTANCES (PER PROJECT COPY)
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
    """
    THIS IS WHERE CONTRIBUTION IS DECLARED (ONBOARDING TIME)
    """
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
        decimal_places=2,
        help_text="Declared during project onboarding"
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
        if self.contribution_percentage <= 0 or self.contribution_percentage > 100:
            raise ValidationError("Contribution must be between 0 and 100")

    def __str__(self):
        return f"{self.stage} → {self.template.name}"


# =====================================================
# TASK ASSIGNMENTS (WHO WORKS)
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

    def __str__(self):
        return f"{self.user} → {self.task.template.name}"


# =====================================================
# VERSIONING
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
        on_delete=models.SET_NULL,
        related_name="rolled_versions"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("element", "version_number")
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.element.template.name} v{self.version_number}"


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
# ATTACHMENTS
# =====================================================

class ProjectAttachment(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="attachments"
    )

    file = models.FileField(upload_to="project_attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
