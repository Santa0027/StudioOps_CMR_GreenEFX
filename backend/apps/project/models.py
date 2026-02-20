from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum, Max
from apps.HR_Payroll.models import User
from apps.Sales.models import Clients, Service  # Import Service
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

    assigned_users = models.ManyToManyField(
        User,
        related_name="assigned_projects",
        blank=True,
        help_text="Users assigned to this project."
    )

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
        max_length=25,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("waiting_review", "Waiting for Review"), # Manager review
            ("waiting_client_review", "Waiting for Client Review"), # Client review
            ("blocked", "Blocked"),
            ("completed", "Completed"),
            ("rejected", "Rejected"),
            ("on_hold", "On Hold"),
        ],
        default="pending"
    )
    initial_notes = models.TextField(blank=True)

    rejection_notes = models.TextField(blank=True)
    previous_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("in_progress", "In Progress"),
            ("waiting_review", "Waiting for Review"),
            ("blocked", "Blocked"),
            ("completed", "Completed"),
            ("rejected", "Rejected"),
            ("on_hold", "On Hold"),
        ],
        null=True,
        blank=True
    )

    # New fields for Manager Approval Workflow
    MANAGER_APPROVAL_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    manager_approval_status = models.CharField(
        max_length=20,
        choices=MANAGER_APPROVAL_STATUS_CHOICES,
        default="pending"
    )
    manager_rework_notes = models.TextField(blank=True)
    manager_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="approved_stage_elements",
        null=True,
        blank=True
    )
    manager_approved_at = models.DateTimeField(null=True, blank=True)

    # New fields for Client Approval Workflow
    CLIENT_APPROVAL_STATUS_CHOICES_CONST = [
        ("not_applicable", "Not Applicable"), # If client approval isn't needed for this task
        ("requested", "Requested"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    client_approval_status = models.CharField(
        max_length=20,
        choices=CLIENT_APPROVAL_STATUS_CHOICES_CONST,
        default="not_applicable"
    )
    client_rework_notes = models.TextField(blank=True)
    client_approved_by = models.ForeignKey( # This might link to a ClientUser model, but for now linking to User
        User,
        on_delete=models.SET_NULL,
        related_name="client_approved_stage_elements",
        null=True,
        blank=True
    )
    client_approved_at = models.DateTimeField(null=True, blank=True)

    staged_for_client_review = models.BooleanField(default=False)


    class Meta:
        ordering = ["order"]
        unique_together = ("stage", "template")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._loaded_values = {'status': self.status}

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
        super().clean() # Call the parent clean method AFTER custom validation.

        # Status transition validation
        if self.pk and self.status != self._loaded_values.get('status'): # Status has changed
            self.validate_status_transition(self._loaded_values.get('status'), self.status)

        # Rejection notes validation
        if self.status == 'rejected' and not self.rejection_notes:
            raise ValidationError("Rejection notes are required when status is 'Rejected'.")

    def _check_approval_status(self):
        """
        Helper to check if manager and client approvals are met for completion.
        Returns (is_manager_approved, is_client_approved)
        """
        manager_approved = self.manager_approval_status == "approved"
        
        # Client approval is considered met if it's not applicable, or if it's approved
        client_approved = (
            self.client_approval_status == "not_applicable" or
            self.client_approval_status == "approved"
        )
        return manager_approved, client_approved

    def validate_status_transition(self, old_status, new_status):
        # Define valid transitions
        valid_transitions = {
            "pending": ["in_progress", "blocked", "on_hold", "rejected"],
            "in_progress": ["waiting_review", "blocked", "on_hold", "completed", "rejected", "waiting_client_review"],
            "waiting_review": ["in_progress", "waiting_client_review", "rejected"],
            "waiting_client_review": ["in_progress", "completed", "rejected"],
            "blocked": ["pending", "in_progress", "on_hold", "rejected"],
            "on_hold": ["pending", "in_progress", "blocked", "rejected"],
            "completed": ["in_progress", "rejected"], # Allow re-opening for fixes, or rejection
            "rejected": ["pending", "in_progress"], # Allow re-opening rejected tasks
        }

        if new_status not in valid_transitions.get(old_status, []):
            raise ValidationError(f"Invalid status transition from '{old_status}' to '{new_status}'.")
        
        # Additional validation for manager and client approval workflows
        if new_status == "waiting_review":
            if old_status == "in_progress" and self.manager_approval_status != "pending":
                raise ValidationError("Manager approval status must be 'pending' to move to 'waiting_review'.")

        elif new_status == "waiting_client_review":
            if old_status == "waiting_review": # Can only move to waiting_client_review from waiting_review (after manager approval)
                if self.manager_approval_status != "approved":
                    raise ValidationError("Task must be manager approved to move to 'Waiting for Client Review'.")
                if not self.staged_for_client_review:
                    raise ValidationError("Task must be staged for client review to move to 'Waiting for Client Review'.")
                self.client_approval_status = "requested"
            else: # Other transitions to waiting_client_review (e.g. from in_progress if manager not involved)
                if self.client_approval_status not in ["not_applicable", "requested"]:
                    raise ValidationError("Client approval status must be 'not_applicable' or 'requested' to move to 'Waiting for Client Review'.")


        elif new_status == "completed":
            manager_approved, client_approved = self._check_approval_status()
            if not manager_approved:
                raise ValidationError("Manager must approve the task before it can be completed.")
            if not client_approved:
                raise ValidationError("Client must approve the task (or it must be 'not_applicable') before it can be completed.")
            
        elif new_status == "in_progress":
            # If a task is moved back to in_progress from waiting_review (e.g., for rework)
            # or from completed, reset approval statuses
            if old_status in ["waiting_review", "waiting_client_review", "completed", "rejected"]:
                self.manager_approval_status = "pending"
                self.manager_rework_notes = ""
                self.client_approval_status = "not_applicable"
                self.client_rework_notes = ""
                self.staged_for_client_review = False
        
        elif new_status == "rejected":
            # If a task is rejected, reset approval statuses
            if old_status in ["waiting_review", "waiting_client_review", "completed", "in_progress"]:
                self.manager_approval_status = "pending"
                self.manager_rework_notes = ""
                self.client_approval_status = "not_applicable"
                self.client_rework_notes = ""
                self.staged_for_client_review = False

    def __str__(self):
        return f"{self.stage} → {self.template.name}"

    def save(self, *args, user=None, **kwargs):
        # Check if this is an update and if the status has changed
        if self.pk and 'status' in self._loaded_values and self.status != self._loaded_values['status']:
            # Create a TaskStatusLog entry
            if user:
                TaskStatusLog.objects.create(
                    task=self,
                    user=user,
                    old_status=self._loaded_values['status'],
                    new_status=self.status
                )
            else:
                # Handle case where user is not provided (e.g., system-initiated change)
                # You might want to log this as a system user or raise an error
                print("Warning: ProjectStageElement status changed without a user provided for logging.")
        
        # Store the old status before saving the new one (needed for next update)
        # This was already present, ensuring previous_status is correctly set
        if self.pk: 
            self.previous_status = self._loaded_values.get('status')

        super().save(*args, **kwargs)
        # Update _loaded_values after saving to reflect the new state
        self._loaded_values['status'] = self.status


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
# STORAGE SETTINGS (GLOBAL SINGLETON)
# =====================================================

class StorageSettingManager(models.Manager):
    def get_singleton(self):
        obj, created = self.get_or_create(pk=1) # Ensure only one instance with primary key 1
        return obj

class StorageSetting(models.Model):
    objects = StorageSettingManager() # Assign the custom manager
    DEFAULT_STORAGE_CHOICES = [
        ("local", "Local Server"),
        ("cloud", "Cloud Server (S3)"),
        ("nas", "NAS Server"),
    ]

    default_source_file_storage = models.CharField(
        max_length=10,
        choices=DEFAULT_STORAGE_CHOICES,
        default="nas",
        help_text="Default storage location for source files."
    )
    default_preview_file_storage = models.CharField(
        max_length=10,
        choices=DEFAULT_STORAGE_CHOICES,
        default="local", # Default for previews
        help_text="Default storage location for preview files."
    )
    default_final_file_storage = models.CharField(
        max_length=10,
        choices=DEFAULT_STORAGE_CHOICES,
        default="cloud", # Default for final deliverables
        help_text="Default storage location for final deliverable files."
    )
    nas_root_path = models.CharField(
        max_length=255,
        default="/mnt/StudioOps",
        help_text="Root path for NAS storage (e.g., /mnt/StudioOps)."
    )
    s3_bucket_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="AWS S3 bucket name for cloud storage."
    )
    s3_region = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="AWS S3 region (e.g., us-east-1)."
    )

    class Meta:
        verbose_name = "Storage Setting"
        verbose_name_plural = "Storage Settings"

    def __str__(self):
        return "Global Storage Settings"

    def save(self, *args, **kwargs):
        if not self.pk and StorageSetting.objects.exists():
            # If an instance already exists, prevent creation of a new one
            # Optionally, update the existing one instead
            existing_setting = StorageSetting.objects.first()
            self.pk = existing_setting.pk
            self.id = existing_setting.id
            super().save(*args, **kwargs) # Update the existing one
            print("Warning: Only one StorageSetting instance is allowed. Updating existing instance.")
            return

        super().save(*args, **kwargs)

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
    relative_path = models.CharField(
        max_length=1024,
        blank=True,
        null=True,
        help_text="Path relative to the uploaded folder, if part of a folder upload."
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
        # Retrieve global storage settings
        try:
            global_storage_settings = StorageSetting.objects.get_singleton()
        except StorageSetting.DoesNotExist:
            global_storage_settings = None

        # Determine the storage_location if not already set or override default based on global settings
        if not self.storage_location:
            if self.asset_role == 'source' or self.asset_type in ['psd', 'ai', 'ae', 'pr']:
                if global_storage_settings and global_storage_settings.default_source_file_storage:
                    self.storage_location = global_storage_settings.default_source_file_storage
                else:
                    self.storage_location = 'nas' # Fallback to NAS if no global setting
            elif self.asset_role == 'preview':
                if global_storage_settings and global_storage_settings.default_preview_file_storage:
                    self.storage_location = global_storage_settings.default_preview_file_storage
                else:
                    self.storage_location = 'local' # Fallback to local
            elif self.asset_role == 'final':
                if global_storage_settings and global_storage_settings.default_final_file_storage:
                    self.storage_location = global_storage_settings.default_final_file_storage
                else:
                    self.storage_location = 'cloud' # Fallback to cloud
            else:
                self.storage_location = 'nas' # Default for other types if role not explicitly matched

        # Handle file saving only if a new file is being uploaded
        if self.file and hasattr(self.file, 'file') and not self.file._committed:
            # Get the raw file content and filename
            self.file.seek(0)
            uploaded_file_content = self.file.file.read()
            uploaded_filename = self.file.name

            target_storage = None
            if self.storage_location == 'cloud':
                if global_storage_settings:
                    target_storage = S3MediaStorage(
                        bucket_name=global_storage_settings.s3_bucket_name,
                        region_name=global_storage_settings.s3_region
                    )
                else:
                    target_storage = S3MediaStorage() # Fallback to settings from django.conf.settings
            elif self.storage_location == 'local':
                target_storage = CustomLocalMediaStorage()
            elif self.storage_location == 'nas':
                if global_storage_settings:
                    target_storage = NASStorage(
                        location=global_storage_settings.nas_root_path
                    )
                else:
                    target_storage = NASStorage() # Fallback to default NAS path
            else:
                target_storage = NASStorage() # Fallback

            if target_storage:
                destination_filename = ProjectAsset.project_asset_upload_path(self, uploaded_filename)
                saved_file_name = target_storage._save(destination_filename, ContentFile(uploaded_file_content))
                self.file.name = saved_file_name
                self.file._file = None
                self.file._committed = True
            else:
                # Handle error if no suitable storage could be determined
                raise ValueError("Could not determine suitable storage for asset.")

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

# =====================================================
# TASK STATUS LOG
# =====================================================

class TaskStatusLog(models.Model):
    task = models.ForeignKey(
        ProjectStageElement,
        on_delete=models.CASCADE,
        related_name="status_logs"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="task_status_changes"
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Task {self.task.id} status changed from {self.old_status} to {self.new_status} by {self.user.name} at {self.timestamp}"