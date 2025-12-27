from rest_framework import serializers
from .models import Clients,Enquiry,Lead

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