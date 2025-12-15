from django.db.models.signals import (
    pre_save,
    post_save,
    post_delete,
    m2m_changed,
)
from django.dispatch import receiver
from django.db import transaction
from django.forms.models import model_to_dict

from .models import (
    User,
    RolePermission,
    DepartmentOfStaff,
    AuditLog,
)

# =========================
# COMMON UTILS
# =========================

def clean_data(data: dict):
    """
    Remove sensitive fields before logging
    """
    if not data:
        return data
    data.pop("password", None)
    return data


# =========================
# USER AUDIT LOGS
# =========================

@receiver(pre_save, sender=User)
def user_pre_save(sender, instance, **kwargs):
    if instance.pk:
        old = User.objects.get(pk=instance.pk)
        instance._old_data = clean_data(model_to_dict(old))
    else:
        instance._old_data = None


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    AuditLog.objects.create(
        entity_type="User",
        entity_id=instance.id,
        entity_name=instance.email,
        action="CREATE" if created else "UPDATE",
        old_data=instance._old_data,
        new_data=clean_data(model_to_dict(instance)),
        performed_by=instance.created_by,
    )


@receiver(post_delete, sender=User)
def user_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        entity_type="User",
        entity_id=instance.id,
        entity_name=instance.email,
        action="DELETE",
        old_data=clean_data(model_to_dict(instance)),
    )


# =========================
# ROLE PERMISSION AUDIT LOGS
# =========================

# ---- CREATE / UPDATE (allowed flag only)
@receiver(post_save, sender=RolePermission)
def role_permission_post_save(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            entity_type="RolePermission",
            entity_id=instance.id,
            entity_name=f"{instance.role} | {instance.module}",
            action="CREATE",
            new_data={
                "actions": list(instance.actions.values_list("name", flat=True)),
                "allowed": instance.allowed,
            },
            performed_by=instance.created_by,
        )


# ---- DELETE
@receiver(post_delete, sender=RolePermission)
def role_permission_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        entity_type="RolePermission",
        entity_id=instance.id,
        entity_name=f"{instance.role} | {instance.module}",
        action="DELETE",
        old_data={
            "actions": list(instance.actions.values_list("name", flat=True)),
            "allowed": instance.allowed,
        },
    )


# ---- MANY TO MANY (ACTIONS FIELD)
@receiver(m2m_changed, sender=RolePermission.actions.through)
def role_permission_actions_changed(
    sender, instance, action, reverse, pk_set, **kwargs
):
    """
    Correct audit logging for ManyToMany 'actions'
    """
    if action not in ("pre_add", "pre_remove", "pre_clear"):
        return

    old_actions = list(instance.actions.values_list("name", flat=True))

    def log_after_commit():
        new_actions = list(instance.actions.values_list("name", flat=True))

        if old_actions != new_actions:
            AuditLog.objects.create(
                entity_type="RolePermission",
                entity_id=instance.id,
                entity_name=f"{instance.role} | {instance.module}",
                action="UPDATE",
                old_data={
                    "actions": old_actions,
                    "allowed": instance.allowed,
                },
                new_data={
                    "actions": new_actions,
                    "allowed": instance.allowed,
                },
                performed_by=instance.created_by,
            )

    transaction.on_commit(log_after_commit)


# =========================
# DEPARTMENT AUDIT LOGS
# =========================

@receiver(pre_save, sender=DepartmentOfStaff)
def department_pre_save(sender, instance, **kwargs):
    if instance.pk:
        old = DepartmentOfStaff.objects.get(pk=instance.pk)
        instance._old_data = model_to_dict(old)
    else:
        instance._old_data = None


@receiver(post_save, sender=DepartmentOfStaff)
def department_post_save(sender, instance, created, **kwargs):
    AuditLog.objects.create(
        entity_type="Department",
        entity_id=instance.id,
        entity_name=instance.name,
        action="CREATE" if created else "UPDATE",
        old_data=instance._old_data,
        new_data=model_to_dict(instance),
        performed_by=instance.created_by,
    )
