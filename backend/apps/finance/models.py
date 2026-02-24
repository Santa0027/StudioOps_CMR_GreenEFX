from django.db import models
from apps.Sales.models import Clients
from apps.project.models import Project

INVOICE_STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Paid", "Paid"),
    ("Partial", "Partial"),
    ("Overdue", "Overdue"),
    ("Cancelled", "Cancelled"),
]

PAYMENT_METHOD_CHOICES = [
    ("Bank Transfer", "Bank Transfer"),
    ("UPI", "UPI"),
    ("Cash", "Cash"),
    ("Check", "Check"),
    ("Other", "Other"),
]

class Invoice(models.Model):
    client = models.ForeignKey(Clients, on_delete=models.CASCADE, related_name="invoices")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    invoice_number = models.CharField(max_length=50, unique=True, null=False, blank=False)
    invoice_date = models.DateField(null=False, blank=False)
    due_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} for {self.client.client_name}"

    @property
    def balance_due(self):
        return self.total_amount - self.paid_amount

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=255, null=False, blank=False)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)

    def __str__(self):
        return f"{self.description} ({self.quantity} x {self.unit_price})"

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} for {self.invoice.invoice_number}"
