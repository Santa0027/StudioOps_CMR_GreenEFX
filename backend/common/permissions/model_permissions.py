from rest_framework.permissions import DjangoModelPermissions

class DjangoModelPermissionsWithView(DjangoModelPermissions):
    """
    Extends DjangoModelPermissions to also check for 'view' permissions on GET requests.
    """
    def __init__(self):
        # Map GET, HEAD, OPTIONS to 'view' permission
        self.perms_map = self.perms_map.copy()
        self.perms_map['GET'] = ['%(app_label)s.view_%(model_name)s']
        self.perms_map['HEAD'] = ['%(app_label)s.view_%(model_name)s']
        self.perms_map['OPTIONS'] = ['%(app_label)s.view_%(model_name)s']
