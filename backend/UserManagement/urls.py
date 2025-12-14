from django.urls import path, include # Added include for completeness
from .views_auth import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import SimpleRouter

# NOTE: The PermissionMatrixSerializer is a Serializer, NOT a ViewSet. 
# You need the RolePermissionManagerViewset here.
from .views import UserDepartment,ModuleViewset,UserRole,RolePermissionManagerViewset 



router = SimpleRouter()
router.register("department",UserDepartment)
router.register("module",ModuleViewset)
router.register("userole",UserRole)

# FIX: Use the ViewSet, not the Serializer.
router.register(
    r"role-permissions",
    RolePermissionManagerViewset,  # <--- CORRECTED CLASS
    basename="role-permission-manager"
)
    

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # You may need 'include' here if you haven't imported it already
    path('', include(router.urls)), # Use path('', include(router.urls)) or just +router.urls
    
]+router.urls