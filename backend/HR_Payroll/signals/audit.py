from datetime import date, datetime
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict

from ..models import AuditLog
from ..middleware import get_current_user, get_current_ip


AUDIT_MODELS = (
    "User",
    "Employee",
    "DepartmentOfStaff",
    "Module",
    "Payroll",
)


def clean_data(data):
    if not data:
        return None

    data.pop("password", None)

    for k, v in data.items():
        if isinstance(v, (date, datetime)):
            data[k] = v.isoformat()

    return data


def should_audit(instance):
    return instance.__class__.__name__ in AUDIT_MODELS


@receiver(pre_save)
def pre_save_capture(sender, instance, **kwargs):
    if not should_audit(instance):
        return

    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_data = clean_data(model_to_dict(old))
        except sender.DoesNotExist:
            instance._old_data = None
    else:
        instance._old_data = None


@receiver(post_save)
def post_save_audit(sender, instance, created, **kwargs):
    if not should_audit(instance):
        return

    user = get_current_user()
    ip = get_current_ip()

    action = "CREATE" if created else "UPDATE"

    # Detect activate/deactivate
    if hasattr(instance, "is_active") and not created:
        old_active = instance._old_data.get("is_active") if instance._old_data else None
        if old_active != instance.is_active:
            action = "ACTIVATE" if instance.is_active else "DEACTIVATE"

    AuditLog.objects.create(
        entity_type=sender.__name__,
        entity_id=instance.pk,
        entity_name=str(instance),
        action=action,
        old_data=instance._old_data,
        new_data=clean_data(model_to_dict(instance)),
        performed_by=user if user and user.is_authenticated else None,
        ip_address=ip,
    )


@receiver(post_delete)
def post_delete_audit(sender, instance, **kwargs):
    if not should_audit(instance):
        return

    AuditLog.objects.create(
        entity_type=sender.__name__,
        entity_id=instance.pk,
        entity_name=str(instance),
        action="DELETE",
        old_data=clean_data(model_to_dict(instance)),
        performed_by=get_current_user(),
        ip_address=get_current_ip(),
    )
