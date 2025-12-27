from rest_framework.routers import DefaultRouter
from .views import ClientViewSet ,LeadViewSet,EnquiryViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r"lead",LeadViewSet)
router.register(r"enquiry",EnquiryViewSet)
urlpatterns = router.urls
