from django.core.management.base import BaseCommand
from apps.finance.models import Invoice, InvoiceItem, Payment
from apps.Sales.models import Clients
from apps.project.models import Project
from django.utils import timezone
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds the database with test finance data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding finance data...")

        clients = Clients.objects.all()
        if not clients.exists():
            self.stdout.write(self.style.ERROR("No clients found. Please seed clients first."))
            return

        projects = Project.objects.all()

        for i in range(5):
            client = random.choice(clients)
            project = random.choice(projects) if projects.exists() else None
            
            invoice = Invoice.objects.create(
                client=client,
                project=project,
                invoice_number=f"INV-2026-{1000 + i}",
                invoice_date=timezone.now().date() - timedelta(days=random.randint(1, 30)),
                due_date=timezone.now().date() + timedelta(days=random.randint(1, 30)),
                total_amount=random.randint(1000, 5000),
                status="Pending"
            )

            # Create items
            InvoiceItem.objects.create(
                invoice=invoice,
                description="Studio Production Services",
                quantity=1,
                unit_price=invoice.total_amount,
                total=invoice.total_amount
            )

            # Randomly add a payment to some invoices
            if random.choice([True, False]):
                payment_amount = invoice.total_amount / 2
                Payment.objects.create(
                    invoice=invoice,
                    amount=payment_amount,
                    payment_date=timezone.now().date(),
                    payment_method="UPI",
                    transaction_id=f"TXN-{random.randint(10000, 99999)}"
                )
                
                # Update invoice
                invoice.paid_amount = payment_amount
                invoice.status = "Partial"
                invoice.save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded finance data!"))
