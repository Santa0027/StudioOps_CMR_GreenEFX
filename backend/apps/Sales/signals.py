from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Lead, Enquiry, Clients, LeadServiceItem, Service, Quotation, QuotationItem
from apps.project.models import Project
from django.db import transaction
from apps.project.services import create_nas_folders, initialize_project_workflow

@receiver(post_save, sender=Lead)
def create_project_from_lead(sender, instance, created, **kwargs):
    """
    Triggered when a Lead status is updated to 'won'.
    Creates Project instances. Prioritizes the 'accepted' quotation items.
    Falls back to LeadServiceItems if no accepted quotation exists.
    """
    # Only trigger if status changed to "won" and no project exists yet
    if instance.status == "won" and not instance.project_created:
        with transaction.atomic():
            # 1. Try to find an accepted quotation for this lead
            accepted_quotation = instance.quotations.filter(status="accepted").first()
            
            projects_to_process = []

            if accepted_quotation:
                # Create projects from quotation items
                for item in accepted_quotation.items.all():
                    project_type = "package" if item.package else "single_service"
                    
                    # Determine template: from service or package
                    folder_template = None
                    if item.service:
                        folder_template = item.service.folder_structure_template
                    # Note: Packages currently don't have a default folder template in models.py, 
                    # but could be added later.

                    project = Project.objects.create(
                        name=f"{item.description} - {instance.client.client_name}",
                        client=instance.client,
                        project_type=project_type,
                        service=item.service,
                        package=item.package,
                        budget=item.total_price,
                        due_date=instance.expected_delivery_date,
                        status="not_started",
                        created_by=instance.assigned_to,
                        initial_requirements=f"From Quotation #{accepted_quotation.quotation_number}\n{instance.notes}",
                        folder_structure_template=folder_template
                    )
                    projects_to_process.append(project)
            else:
                # 2. Fallback: Use service items if no quotation was accepted
                service_items = instance.service_items.all()
                for item in service_items:
                    project = Project.objects.create(
                        name=f"{item.service.name} - {instance.client.client_name}",
                        client=instance.client,
                        project_type="single_service",
                        service=item.service,
                        budget=item.custom_price or (item.service.base_price * item.quantity if item.service.base_price else None),
                        due_date=instance.expected_delivery_date,
                        status="not_started",
                        created_by=instance.assigned_to,
                        initial_requirements=f"{instance.notes}\n\nService Notes: {item.notes}",
                        folder_structure_template=item.service.folder_structure_template
                    )
                    projects_to_process.append(project)

            # 3. Post-creation automation for all projects
            for project in projects_to_process:
                # 2. Create physical NAS Folders based on Service -> Folder Structure Template
                if project.folder_structure_template:
                    create_nas_folders(project)

            # Mark that projects were created to avoid duplicates
            instance.project_created = True
            instance.save(update_fields=['project_created'])


@receiver(post_save, sender=Enquiry)
def create_lead_by_enquiry(sender, instance, created, **kwargs):
    """
    Triggered when an Enquiry is marked as 'qualified'.
    Creates a Lead and attempts to map 'service_interested' to a Service item.
    """
    if instance.status != "qualified":
        return

    # Avoid duplicate lead creation for the same enquiry
    if hasattr(instance, "lead"):
        return

    with transaction.atomic():
        # Try to find an existing client or create a new one based on email
        client, created_client = Clients.objects.get_or_create(
            email=instance.client_email,
            defaults={
                'client_name': instance.client_name,
                'phone': instance.client_phone,
                'status': 'Active'
            }
        )

        # Create the Lead
        lead = Lead.objects.create(
            enquiry=instance,
            client=client,
            assigned_to=instance.assigned_to,
            notes=f"Auto-created from enquiry #{instance.id}.\nService interested: {instance.service_interested}.\nOriginal budget range: {instance.budget_range}.\nOriginal notes: {instance.notes}"
        )

        # Automation: Auto-create LeadServiceItem if service_interested matches a Service name
        if instance.service_interested:
            try:
                # Attempt to find a matching service case-insensitively
                matched_service = Service.objects.filter(name__iexact=instance.service_interested.strip()).first()
                if matched_service:
                    LeadServiceItem.objects.create(
                        lead=lead,
                        service=matched_service,
                        quantity=1,
                        notes="Auto-created from enquiry interest"
                    )
            except Exception as e:
                # Log error but don't break the transaction for core lead creation
                print(f"Error auto-creating LeadServiceItem from enquiry: {e}")


@receiver(post_save, sender=Quotation)
def update_lead_status_on_quotation_accept(sender, instance, created, **kwargs):
    """
    Automatically marks the linked Lead as 'won' when a Quotation is accepted.
    This in turn triggers the create_project_from_lead signal.
    """
    if instance.status == "accepted":
        lead = instance.lead
        if lead.status != "won":
            lead.status = "won"
            lead.save(update_fields=['status'])


@receiver(post_save, sender=QuotationItem)
@receiver(post_delete, sender=QuotationItem)
def recalculate_quotation_total(sender, instance, **kwargs):
    """
    Updates the total_amount of a Quotation whenever its items are modified.
    """
    quotation = instance.quotation
    total_amount = sum(item.total_price for item in quotation.items.all())
    quotation.total_amount = total_amount
    quotation.save(update_fields=['total_amount'])
