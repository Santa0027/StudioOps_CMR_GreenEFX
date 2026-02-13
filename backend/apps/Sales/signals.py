from django.db.models.signals import post_save , post_delete
from django.dispatch import receiver
from .models import Lead , Enquiry, Clients
from apps.project.models import Project
from .models import Quotation,QuotationItem
from django.db import transaction

@receiver(post_save, sender=Lead)
def create_project_from_lead(sender, instance, created, **kwargs):
    # Only trigger if status changed to "won" and no project exists yet
    if instance.status == "won" and not instance.project_created:
        project = Project.objects.create(
            client=instance.client,
            project_type="single_service",  # or based on lead type
            # service_type field should be set based on LeadServiceItem or other logic
            budget=instance.estimated_budget,
            due_date=instance.expected_delivery_date,
            status="not_started",
            created_by=instance.assigned_to,  # or manager
            initial_requirements=instance.notes
        )
        # Optional: auto-create stages based on service type
        # create_stages_for_project(project)

        # Mark that a project was created to avoid duplicates
        instance.project_created = True
        instance.save(update_fields=['project_created'])




@receiver(post_save, sender=Enquiry)
def create_lead_by_enquiry(sender, instance, created, **kwargs):
    # Only proceed if the enquiry status is 'qualified' and it's not a new instance
    # (i.e., it's an update) or if it's a new instance and already qualified.
    # We want to trigger this when an existing enquiry *becomes* qualified.
    if instance.status != "qualified":
        return

    # Avoid duplicate lead creation for the same enquiry
    if hasattr(instance, "lead"):
        return

    with transaction.atomic():
        # Try to find an existing client or create a new one
        client, created_client = Clients.objects.get_or_create(
            email=instance.client_email,
            defaults={
                'client_name': instance.client_name,
                'phone': instance.client_phone,
                'status': 'Active' # Default status for new clients
            }
        )

        lead = Lead.objects.create(
            enquiry=instance,
            client=client,
            # services_requested removed; handled via LeadServiceItem or notes
            estimated_budget=None, # Set to None for now, or implement parsing logic
            assigned_to=instance.assigned_to,
            notes=f"Auto-created from enquiry #{instance.id}. Service interested: {instance.service_interested}. Original budget range: {instance.budget_range}. Original notes: {instance.notes}"
        )
        

@receiver(post_save, sender=QuotationItem)
@receiver(post_delete, sender=QuotationItem)
 
@receiver(post_delete, sender=QuotationItem)
def recalculate_quotation_total(sender, instance, **kwargs):
    quotation = instance.quotation
    total_amount = sum(item.total_price for item in quotation.items.all())
    quotation.total_amount = total_amount
    quotation.save(update_fields=['total_amount'])        