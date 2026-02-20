from rest_framework import serializers
from .models import (
    Clients, Enquiry, Lead, FollowUp, LeadFollowUp,
    Service, LeadSource, LeadAttachment, LeadServiceItem,
    Quotation, QuotationItem
)
from apps.HR_Payroll.models import User # For UserSerializer if needed elsewhere, but models import covers it

# Helper for User data if needed to display assigned_to etc.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email'] # Assuming User has 'name' and 'email' fields


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clients
        fields = '__all__'


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'

# --- New/Updated Serializers ---

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class LeadSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSource
        fields = '__all__'

class LeadAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = LeadAttachment
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at']

class LeadServiceItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = LeadServiceItem
        fields = '__all__'

class QuotationItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = QuotationItem
        fields = '__all__'
        read_only_fields = ['total_price'] # total_price is calculated in model

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True) # Nested items
    prepared_by_details = UserSerializer(source='prepared_by', read_only=True)
    lead_client_name = serializers.CharField(source='lead.client.client_name', read_only=True)

    class Meta:
        model = Quotation
        fields = '__all__'
        read_only_fields = ['quotation_number', 'issue_date', 'total_amount', 'prepared_by', 'created_at', 'updated_at']


class LeadSerializer(serializers.ModelSerializer):
    enquiry = EnquirySerializer(read_only=True) # Nested enquiry details
    source_details = LeadSourceSerializer(source='source', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    service_items = LeadServiceItemSerializer(many=True, read_only=True) # Nested service items
    attachments = LeadAttachmentSerializer(many=True, read_only=True) # Nested attachments
    quotations = QuotationSerializer(many=True, read_only=True) # Nested quotations

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at'] # Add other read_only_fields as needed


class FollowUpSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = FollowUp
        fields = '__all__'
        read_only_fields = ['created_by']


class LeadFollowUpSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = LeadFollowUp
        fields = '__all__'
        read_only_fields = ['created_by']
