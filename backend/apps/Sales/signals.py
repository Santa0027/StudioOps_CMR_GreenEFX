from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Lead, Enquiry, Clients, LeadServiceItem, Service, Quotation, QuotationItem
from apps.project.models import Project
from django.db import transaction
from apps.project.services import create_nas_folders, initialize_project_workflow
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Lead)
def create_project_from_lead(sender, instance, created, **kwargs):
    """
    Triggered when a Lead status is updated to 'won'.
    Creates Project instances. Prioritizes the 'accepted' quotation items.
    Falls back to LeadServiceItems if no accepted quotation exists or if it has no items.
    """
    # Only trigger if status changed to "won" and no project exists yet
    if instance.status == "won" and not instance.project_created:
        print(f"DEBUG: Signal triggered for Lead {instance.id} - status is 'won'")
        with transaction.atomic():
            # 1. Try to find an accepted quotation for this lead
            accepted_quotation = instance.quotations.filter(status="accepted").first()
            
            projects_to_process = []

            # Use quotation items only if they exist
            if accepted_quotation and accepted_quotation.items.exists():
                print(f"DEBUG: Found accepted quotation {accepted_quotation.quotation_number} with {accepted_quotation.items.count()} items")
                # Create projects from quotation items
                for item in accepted_quotation.items.all():
                    project_type = "package" if item.package else "single_service"
                    
                    folder_template = None
                    if item.service:
                        folder_template = item.service.folder_structure_template

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
                    if instance.assigned_to:
                        project.assigned_users.add(instance.assigned_to)
                    
                    projects_to_process.append(project)
            
            # 2. Fallback: Use service items if no quotation items found
            if not projects_to_process:
                service_items = instance.service_items.all()
                if service_items.exists():
                    print(f"DEBUG: No quotation items, using {service_items.count()} service items")
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
                        if instance.assigned_to:
                            project.assigned_users.add(instance.assigned_to)

                        projects_to_process.append(project)
            
            # 3. Final Fallback: Create one generic project if still no projects
            if not projects_to_process:
                print(f"DEBUG: No items found anywhere, creating 1 generic project")
                project = Project.objects.create(
                    name=f"Project for {instance.client.client_name}",
                    client=instance.client,
                    project_type="single_service",
                    budget=instance.estimated_budget,
                    due_date=instance.expected_delivery_date,
                    status="not_started",
                    created_by=instance.assigned_to,
                    initial_requirements=instance.notes
                )
                if instance.assigned_to:
                    project.assigned_users.add(instance.assigned_to)
                projects_to_process.append(project)

            # 4. Post-creation automation for all projects
            for project in projects_to_process:
                print(f"DEBUG: Post-processing Project {project.id}")
                if project.folder_structure_template:
                    success, msg = create_nas_folders(project)
                    print(f"DEBUG: NAS folder creation: {success} - {msg}")

            # Mark that projects were created to avoid duplicates
            instance.project_created = True
            instance.save(update_fields=['project_created'])
            print(f"DEBUG: Lead {instance.id} marked as project_created=True")


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
            print(f"DEBUG: Quotation {instance.quotation_number} accepted, marking Lead {lead.id} as 'won'")
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
            print(f"DEBUG: Quotation {instance.quotation_number} accepted, marking Lead {lead.id} as 'won'")
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
