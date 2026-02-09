from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum, Max
from HR_Payroll.models import User
from Sales.models import Clients, Service  # Import Service
from django.db.models import JSONField # Import JSONField
from django.core.files.base import ContentFile # MOVED TO TOP
from .utils.storages import NASStorage, S3MediaStorage, CustomLocalMediaStorage # Import all storage classes
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

    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        related_name="projects",
        null=True,
        blank=True
    )

    package = models.ForeignKey(
        'Package', # Use string reference if Package is defined later in the same file
        on_delete=models.SET_NULL,
        related_name="projects",
        null=True,
        blank=True
    )

    folder_structure_template = models.ForeignKey(
        'FolderStructureTemplate',
        on_delete=models.SET_NULL,
        related_name="projects",
        null=True,
        blank=True,
        help_text="Optional: The folder structure template to use for this project."
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

    def clean(self):
        super().clean()
        if self.project_type == "single_service":
            if not self.service:
                raise ValidationError(
                    {"service": "Service must be selected for single service projects."}
                )
            if self.package:
                raise ValidationError(
                    {"package": "Package cannot be selected for single service projects."}
                )
        elif self.project_type == "package":
            if not self.package:
                raise ValidationError(
                    {"package": "Package must be selected for package projects."}
                )
            if self.service:
                raise ValidationError(
                    {"service": "Service cannot be selected for package projects."}
                )
        else: # Should not happen due to choices, but for robustness
            if self.service and self.package:
                raise ValidationError(
                    "Only one of service or package can be selected."
                )
            if not self.service and not self.package:
                raise ValidationError(
                    "Either a service or a package must be selected."
                )

    @property
    def overall_progress(self):
        # Calculate total contribution of all elements
        total_contribution = ProjectStageElement.objects.filter(
            stage__project=self
        ).aggregate(
            total=Sum("contribution_percentage")
        )["total"]

        if not total_contribution:
            return 0  # No elements, so 0% progress

        # Calculate completed contribution
        completed_contribution = ProjectStageElement.objects.filter(
            stage__project=self,
            status="completed"
        ).aggregate(
            completed=Sum("contribution_percentage")
        )["completed"] or 0

        # Calculate progress as a percentage
        if total_contribution == 0: # Avoid division by zero if total_contribution is 0 but completed_contribution is also 0
            return 0
        progress = (completed_contribution / total_contribution) * 100
        return round(progress, 2)


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

    @property
    def stage_progress(self):
        # Calculate total contribution of all elements within this stage
        total_contribution = self.elements.aggregate(
            total=Sum("contribution_percentage")
        )["total"]

        if not total_contribution:
            return 0  # No elements, so 0% progress for this stage

        # Calculate completed contribution for this stage
        completed_contribution = self.elements.filter(
            status="completed"
        ).aggregate(
            completed=Sum("contribution_percentage")
        )["completed"] or 0

        # Calculate progress as a percentage
        if total_contribution == 0: # Avoid division by zero if total_contribution is 0 but completed_contribution is also 0
            return 0
        progress = (completed_contribution / total_contribution) * 100
        return round(progress, 2)


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
    initial_notes = models.TextField(blank=True)

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
    initial_notes = models.TextField(blank=True) # New field for initial notes
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "user")


# =====================================================
# TASK COMMENTS
# =====================================================

class TaskComment(models.Model):
    task = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="task_comments"
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.name} on {self.task.template.name}"



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
        ("nas", "NAS Server"),
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
        default="nas"
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
        # Determine the storage_location if not already set
        if not self.storage_location:
            if self.asset_role in ['preview', 'final'] or self.asset_type in ['image', 'video']:
                self.storage_location = 'local'
            elif self.asset_role == 'source' or self.asset_type in ['psd', 'ai', 'ae', 'pr']:
                self.storage_location = 'nas'
            else:
                self.storage_location = 'nas'

        # Handle file saving only if a new file is being uploaded
        if self.file and hasattr(self.file, 'file') and not self.file._committed:
            # Get the raw file content and filename
            # Ensure we seek to the beginning of the file to read its content
            self.file.seek(0)
            uploaded_file_content = self.file.file.read()
            uploaded_filename = self.file.name

            # Determine the target storage instance
            if self.storage_location == 'cloud':
                target_storage = S3MediaStorage()
            elif self.storage_location == 'local':
                target_storage = CustomLocalMediaStorage()
            else: # 'nas' or default
                target_storage = NASStorage()

            # Save the file to the target storage
            # The name might be dynamically generated by project_asset_upload_path
            # We need to manually call project_asset_upload_path to get the destination path
            destination_filename = self.project_asset_upload_path(self, uploaded_filename) # pass self as instance
            saved_file_name = target_storage._save(destination_filename, ContentFile(uploaded_file_content))

            # Update the file field to point to the saved file's name in the new storage
            self.file.name = saved_file_name
            # Set _file to None so FileField doesn't try to save it again with default storage
            self.file._file = None
            self.file._committed = True # Mark as committed to prevent re-saving by FileField

        if not self.pk:
            last_version = ProjectAsset.objects.filter(
                element=self.element,
                client_review=self.client_review
            ).aggregate(
                max_v=Max("version_number")
            )["max_v"] or 0

            self.version_number = last_version + 1

        super().save(*args, **kwargs)
        
    


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

# =====================================================
# FOLDER STRUCTURE TEMPLATES
# =====================================================

class FolderStructureTemplate(models.Model):
    name = models.CharField(max_length=255, unique=True, help_text="A unique name for the folder structure template.")
    description = models.TextField(blank=True, help_text="A brief description of this template.")
    structure = JSONField(help_text="JSON representation of the folder structure tree.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name