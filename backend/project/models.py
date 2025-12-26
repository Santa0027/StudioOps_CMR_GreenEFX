from django.db import models
from HR_Payroll.models import User
from Sales.models import Clients

# -------------------------------
# Project Model
# -------------------------------
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
    description = models.TextField(blank=True , default= "None")
    client = models.ForeignKey(Clients, on_delete=models.PROTECT, related_name="projects")
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES , default="Single Service")
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES, default="Graphic Design")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
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

    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="updated_projects", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# -------------------------------
# Package Model
# -------------------------------
class Package(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2 ,default=True)

    def __str__(self):
        return self.name


class ProjectPackage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_packages")
    package = models.ForeignKey(Package, on_delete=models.PROTECT)

    class Meta:
        unique_together = ("project", "package")


# -------------------------------
# Project Stage / Milestone
# -------------------------------
class ProjectStage(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="stages")
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, default= "")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rejection_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        unique_together = ("project", "name")

    def __str__(self):
        return f"{self.project.name} → {self.name}"


# -------------------------------
# Stage Element / Task
# -------------------------------
class ProjectStageElement(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]

    stage = models.ForeignKey(ProjectStage, on_delete=models.CASCADE, related_name="elements")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True , default= "")
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_elements")
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(null=True, blank=True)
    rejection_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]
        unique_together = ("stage", "name")

    def __str__(self):
        return f"{self.stage.name} → {self.name}"


# -------------------------------
# Stage Element Version (Versioning / Rollback)
# -------------------------------
class StageElementVersion(models.Model):
    element = models.ForeignKey(ProjectStageElement, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="stage_element_versions/")
    status = models.CharField(max_length=20, choices=ProjectStageElement.STATUS_CHOICES, default="pending")
    rejection_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    rollback_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="rolled_versions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = ("element", "version_number")

    def __str__(self):
        return f"{self.element.name} v{self.version_number}"


# -------------------------------
# Artist / Employee Contribution
# -------------------------------
class ArtistContribution(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="contributors")
    artist = models.ForeignKey(User, on_delete=models.PROTECT, related_name="project_contributions")
    role = models.CharField(max_length=100, default="artist")
    percentage = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ("project", "artist")

    def __str__(self):
        return f"{self.artist.name} → {self.project.name}"


# -------------------------------
# Project Attachments
# -------------------------------
class ProjectAttachment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="project_attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)


# -------------------------------
# Project Task Time Logs
# -------------------------------
class ProjectTimeLog(models.Model):
    task = models.ForeignKey(ProjectStageElement, on_delete=models.CASCADE, related_name="time_logs")
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    hours_spent = models.DecimalField(max_digits=5, decimal_places=2)
    log_date = models.DateField(auto_now_add=True)
    note = models.TextField(blank=True)


# -------------------------------
# Stage Element Inputs/Outputs (Optional)
# -------------------------------
class StageElementInputOutput(models.Model):
    element_version = models.ForeignKey(StageElementVersion, on_delete=models.CASCADE, related_name="inputs_outputs")
    input_type = models.CharField(max_length=50, choices=[
        ("file", "File Upload"),
        ("text", "Text Notes"),
        ("status_update", "Status Update"),
        ("time_log", "Time Log"),
        ("comment", "Comment")
    ])
    input_content = models.TextField(blank=True, null=True)
    time_logged = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.element_version.element.name} - {self.input_type}"
