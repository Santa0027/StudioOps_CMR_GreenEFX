from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ClientViewSet, LeadViewSet, EnquiryViewSet, FollowUpViewSet, LeadFollowUpViewSet,
    ServiceViewSet, LeadSourceViewSet, LeadAttachmentViewSet, LeadServiceItemViewSet,
    QuotationViewSet, QuotationItemViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r"lead", LeadViewSet)
router.register(r"enquiry", EnquiryViewSet)
router.register(r"followup", FollowUpViewSet)
router.register(r"leadfollowup", LeadFollowUpViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"lead-sources", LeadSourceViewSet)
router.register(r"lead-attachments", LeadAttachmentViewSet)
router.register(r"lead-service-items", LeadServiceItemViewSet)
router.register(r"quotations", QuotationViewSet)
router.register(r"quotation-items", QuotationItemViewSet)


urlpatterns = [
    path('', include(router.urls)),
]