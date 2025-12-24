from django.db import models
from HR_Payroll.models import User
from project.models import Project

TASK_STATUS_CHOICES = [
    ("To Do", "To Do"),
    ("In Progress", "In Progress"),
    ("Done", "Done"),
    ("Blocked", "Blocked"),
]

TASK_PRIORITY_CHOICES = [
    ("Low", "Low"),
    ("Medium", "Medium"),
    ("High", "High"),
]

class Task(models.Model):
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default="To Do")
    priority = models.CharField(max_length=10, choices=TASK_PRIORITY_CHOICES, default="Medium")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
