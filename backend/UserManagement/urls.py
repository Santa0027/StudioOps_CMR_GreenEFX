from django.urls import path
from .views_auth import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import SimpleRouter


from .views import UserDepartment,ModuleViewset,UserRole



router = SimpleRouter()
router.register("department",UserDepartment)
router.register("module",ModuleViewset)
router.register("userole",UserRole)
    

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
   
]+router.urls
