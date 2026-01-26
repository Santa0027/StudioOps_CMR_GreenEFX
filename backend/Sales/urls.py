from rest_framework.routers import DefaultRouter
from .views import ClientViewSet ,LeadViewSet,EnquiryViewSet, FollowUpViewSet, LeadFollowUpViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r"lead",LeadViewSet)
router.register(r"enquiry",EnquiryViewSet)
router.register(r"followup",FollowUpViewSet)
router.register(r"leadfollowup",LeadFollowUpViewSet)
urlpatterns = router.urls
