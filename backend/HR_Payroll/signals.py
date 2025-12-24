# from datetime import date, datetime

# from django.db.models.signals import pre_save, post_save, post_delete
# from django.dispatch import receiver
# from django.forms.models import model_to_dict

# from .models import (
#     User,
#     DepartmentOfStaff,
#     RolePermission,
#     AuditLog,
# )
# def clean_data(data: dict | None):
#     """
#     Remove sensitive fields and convert non-serializable values
#     """
#     if not data:
#         return None

#     data.pop("password", None)

#     for key, value in data.items():
#         if isinstance(value, (date, datetime)):
#             data[key] = value.isoformat()

#     return data




# @receiver(pre_save, sender=User)
# def user_pre_save(sender, instance, **kwargs):
#     if instance.pk:
#         old = User.objects.get(pk=instance.pk)
#         instance._old_data = clean_data(model_to_dict(old))
#     else:
#         instance._old_data = None




# @receiver(post_save, sender=User)
# def user_post_save(sender, instance, created, **kwargs):
#     AuditLog.objects.create(
#         entity_type="User",
#         entity_id=instance.id,
#         entity_name=instance.email,
#         action="CREATE" if created else "UPDATE",
#         old_data=instance._old_data,
#         new_data=clean_data(model_to_dict(instance)),
#         performed_by=instance.created_by,
#     )




# @receiver(post_delete, sender=User)
# def user_post_delete(sender, instance, **kwargs):
#     AuditLog.objects.create(
#         entity_type="User",
#         entity_id=instance.id,
#         entity_name=instance.email,
#         action="DELETE",
#         old_data=clean_data(model_to_dict(instance)),
#     )


# @receiver(pre_save, sender=DepartmentOfStaff)
# def department_pre_save(sender, instance, **kwargs):
#     if instance.pk:
#         old = DepartmentOfStaff.objects.get(pk=instance.pk)
#         instance._old_data = clean_data(model_to_dict(old))
#     else:
#         instance._old_data = None


# @receiver(post_save, sender=DepartmentOfStaff)
# def department_post_save(sender, instance, created, **kwargs):
#     AuditLog.objects.create(
#         entity_type="Department",
#         entity_id=instance.id,
#         entity_name=instance.name,
#         action="CREATE" if created else "UPDATE",
#         old_data=instance._old_data,
#         new_data=clean_data(model_to_dict(instance)),
#         performed_by=instance.created_by,
#     )


# @receiver(post_delete, sender=DepartmentOfStaff)
# def department_post_delete(sender, instance, **kwargs):
#     AuditLog.objects.create(
#         entity_type="Department",
#         entity_id=instance.id,
#         entity_name=instance.name,
#         action="DELETE",
#         old_data=clean_data(model_to_dict(instance)),
#     )


# @receiver(post_save, sender=RolePermission)
# def role_permission_create(sender, instance, created, **kwargs):
#     if not created:
#         return

#     AuditLog.objects.create(
#         entity_type="RolePermission",
#         entity_id=instance.id,
#         entity_name=f"{instance.role} | {instance.module}",
#         action="CREATE",
#         new_data={
#             "actions": list(instance.actions.values_list("name", flat=True)),
#             "allowed": instance.allowed,
#         },
#         performed_by=instance.created_by,
#     )


# @receiver(post_delete, sender=RolePermission)
# def role_permission_delete(sender, instance, **kwargs):
#     AuditLog.objects.create(
#         entity_type="RolePermission",
#         entity_id=instance.id,
#         entity_name=f"{instance.role} | {instance.module}",
#         action="DELETE",
#         old_data={
#             "actions": list(instance.actions.values_list("name", flat=True)),
#             "allowed": instance.allowed,
#         },
#     )
