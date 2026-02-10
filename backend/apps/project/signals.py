# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import (
    Project,
    ProjectStage,
    ProjectStageElement,
    ProjectTaskAssignment,
    StageElementVersion,
    ProjectTimeLog,
    ProjectAsset,
    ClientReviewLog,
    VersionAuditLog
)


def create_audit_log(instance, action, user=None, extra=""):
    """
    Generic function to create audit logs.
    Stores model, action, user, and optional extra info.
    """
    # Example: VersionAuditLog for StageElementVersion
    if isinstance(instance, StageElementVersion):
        VersionAuditLog.objects.create(
            version=instance,
            action=action,
            notes=extra,
            performed_by=user
        )
    else:
        # For generic models, you can add a GenericAuditLog model if needed
        # For now, printing to console (replace with actual AuditLog model)
        print(f"AUDIT LOG: {instance} | Action: {action} | User: {user} | Extra: {extra}")


# ==========================================================
# Project
# ==========================================================
@receiver(post_save, sender=Project)
def project_post_save(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=Project)
def project_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Project Stage
# ==========================================================
@receiver(post_save, sender=ProjectStage)
def stage_post_save(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=ProjectStage)
def stage_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Project Stage Element
# ==========================================================
@receiver(post_save, sender=ProjectStageElement)
def stage_element_post_save(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=ProjectStageElement)
def stage_element_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Project Task Assignment
# ==========================================================
@receiver(post_save, sender=ProjectTaskAssignment)
def task_assignment_post_save(sender, instance, created, **kwargs):
    action = "assigned" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=ProjectTaskAssignment)
def task_assignment_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "unassigned", user)


# ==========================================================
# Stage Element Version
# ==========================================================
@receiver(post_save, sender=StageElementVersion)
def version_post_save(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=StageElementVersion)
def version_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Project Time Log
# ==========================================================
@receiver(post_save, sender=ProjectTimeLog)
def time_log_post_save(sender, instance, created, **kwargs):
    action = "logged" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=ProjectTimeLog)
def time_log_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Project Asset
# ==========================================================
@receiver(post_save, sender=ProjectAsset)
def asset_post_save(sender, instance, created, **kwargs):
    action = "uploaded" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)


@receiver(post_delete, sender=ProjectAsset)
def asset_post_delete(sender, instance, **kwargs):
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, "deleted", user)


# ==========================================================
# Client Review Log
# ==========================================================
@receiver(post_save, sender=ClientReviewLog)
def review_post_save(sender, instance, created, **kwargs):
    action = "reviewed" if created else "updated"
    user = getattr(instance, "_current_user", None)
    create_audit_log(instance, action, user)
