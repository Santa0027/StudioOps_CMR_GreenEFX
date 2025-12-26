from django.db import models
from HR_Payroll.models import User # Import the User model

STATUS_CHOICES = [
    ("Active", "Active"),
    ("On Hold", "On Hold"),
    ("Archived", "Archived"),
]

class Clients(models.Model):
    client_name = models.CharField(max_length=60, null=False, blank=False, default="")
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    contact_person = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="clients") # Link to User model
    website = models.URLField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    logo_url = models.URLField(max_length=200, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Account Details
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=50, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)

    # Register Details
    registration_number = models.CharField(max_length=100, null=True, blank=True)

    # GST Details
    gst_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return self.client_name
