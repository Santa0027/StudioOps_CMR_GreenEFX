from rest_framework import serializers
from .models import Clients,Enquiry,Lead, FollowUp, LeadFollowUp

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clients
        fields = '__all__'


class EnquirySerializer(serializers.ModelSerializer):
    class Meta :
        model = Enquiry
        fields = '__all__'
     
class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'        

class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = '__all__'

class LeadFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadFollowUp
        fields = '__all__'