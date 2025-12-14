from .models import RolePermission


def has_permission(user, module_code, action):
    if user.is_superuser:
        return True

    if not user.role:
        return False

    return RolePermission.objects.filter(
        role=user.role,
        module__code=module_code,
        action=action,
        allowed=True
    ).exists()
