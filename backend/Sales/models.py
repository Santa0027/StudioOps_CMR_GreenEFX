from django.db import models
from HR_Payroll.models import User # Import the User model

STATUS_CHOICES = [
    ("Active", "Active"),
    ("On Hold", "On Hold"),
    ("Archived", "Archived"),
]



class Enquiry(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("converted", "Converted"),
        ("lost", "Lost"),
    ]

    client_name = models.CharField(max_length=255)
    client_email = models.EmailField(blank=True, null=True)
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    service_interested = models.CharField(max_length=100, blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=50, blank=True)  # e.g., website, referral
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_enquiries", null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_enquiries")  # Sales
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client_name} ({self.status})"



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


class Lead(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("proposal_sent", "Proposal Sent"),
        ("negotiation", "Negotiation"),
        ("won", "Won"),
        ("lost", "Lost"),
    ]

    enquiry = models.OneToOneField(Enquiry, on_delete=models.CASCADE, related_name="lead")
    client = models.ForeignKey(Clients, on_delete=models.PROTECT, related_name="leads")
    services_requested = models.CharField(max_length=255, blank=True)
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_leads")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    project_created = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):

        return f"{self.client.name} ({self.status})"

    

    

class FollowUp(models.Model):

        enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name="follow_ups")

        follow_up_date = models.DateTimeField()

        notes = models.TextField()

        created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="enquiry_follow_ups")

    

        def __str__(self):

            return f"Follow-up for {self.enquiry.client_name} on {self.follow_up_date}"

    

    

class LeadFollowUp(models.Model):

        lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="follow_ups")

        follow_up_date = models.DateTimeField()

        notes = models.TextField()

        created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="lead_follow_ups")

    

        def __str__(self):

            return f"Follow-up for {self.lead.client.name} on {self.follow_up_date}"

    