from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead
from project.models import Project

@receiver(post_save, sender=Lead)
def create_project_from_lead(sender, instance, created, **kwargs):
    # Only trigger if status changed to "won" and no project exists yet
    if instance.status == "won" and not hasattr(instance, 'project_created'):
        project = Project.objects.create(
            client=instance.client,
            project_type="single_service",  # or based on lead type
            service_type=instance.services_requested,
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
