from rest_framework.permissions import BasePermission


class IsInternalUser(BasePermission):
    """
    Allows access only to internal studio users (Staff, Admins, Managers, Artists)
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        return (
            request.user.is_staff or 
            request.user.groups.filter(name__in=['Admin', 'Manager', 'Artist']).exists()
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
            and not request.user.groups.filter(name__in=['Admin', 'Manager', 'Artist']).exists()
        )
