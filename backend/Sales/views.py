from rest_framework import viewsets
from .models import Clients,Lead,Enquiry, FollowUp, LeadFollowUp
from .serializers import ClientSerializer,EnquirySerializer,LeadSerializer, FollowUpSerializer, LeadFollowUpSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Clients.objects.all()
    serializer_class = ClientSerializer


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    
class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUpSerializer
    
    def perform_create(self, serializer):
        return serializer.save(created_by=self.request.user)

class LeadFollowUpViewSet(viewsets.ModelViewSet):
    queryset = LeadFollowUp.objects.all()
    serializer_class = LeadFollowUpSerializer
    
    def perform_create(self, serializer):
        return serializer.save(created_by=self.request.user)