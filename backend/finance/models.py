from django.db import models
from Sales.models import Clients
from project.models import Project

INVOICE_STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Paid", "Paid"),
    ("Overdue", "Overdue"),
    ("Cancelled", "Cancelled"),
]

class Invoice(models.Model):
    client = models.ForeignKey(Clients, on_delete=models.CASCADE, related_name="invoices")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    invoice_number = models.CharField(max_length=50, unique=True, null=False, blank=False)
    invoice_date = models.DateField(null=False, blank=False)
    due_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} for {self.client.client_name}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=255, null=False, blank=False)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)

    def __str__(self):
        return f"{self.description} ({self.quantity} x {self.unit_price})"
