from rest_framework.permissions import BasePermission


class IsInternalUser(BasePermission):
    """
    Allows access only to internal studio users
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsClientUser(BasePermission):
    """
    Allows access only to client users
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and not request.user.is_staff
        )
