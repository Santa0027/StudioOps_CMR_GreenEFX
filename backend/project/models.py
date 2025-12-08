from django.db import models
from UserManagement.models import User
from clients.models import Clients

PROJECT_STATUS_CHOICES = [
    ("Not Started", "Not Started"),
    ("In Progress", "In Progress"),
    ("Completed", "Completed"),
    ("On Hold", "On Hold"),
    ("Cancelled", "Cancelled"),
]

class Project(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    client = models.ForeignKey(Clients, on_delete=models.CASCADE, related_name="projects")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_projects")
    status = models.CharField(max_length=20, choices=PROJECT_STATUS_CHOICES, default="Not Started")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Package(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProjectStage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="stages")
    name = models.CharField(max_length=100, null=False, blank=False)
    order = models.IntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PROJECT_STATUS_CHOICES, default="Not Started")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["project", "order"]
        unique_together = ("project", "name")  # Ensure unique stage names per project

    def __str__(self):
        return f"{self.project.name} - {self.name}"


class ArtistContribution(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="contributions")
    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name="project_contributions")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=False, blank=False)
    role = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("project", "artist")  # Ensure one contribution entry per artist per project
        ordering = ["project", "artist__name"]

    def __str__(self):
        return f"{self.artist.name} - {self.project.name} ({self.percentage}%)"


class ProjectStageElement(models.Model):
    stage = models.ForeignKey(ProjectStage, on_delete=models.CASCADE, related_name="elements")
    name = models.CharField(max_length=100, null=False, blank=False)
    order = models.IntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PROJECT_STATUS_CHOICES, default="Not Started")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["stage", "order"]
        unique_together = ("stage", "name")  # Ensure unique element names per stage

    def __str__(self):
        return f"{self.stage.project.name} - {self.stage.name} - {self.name}"
