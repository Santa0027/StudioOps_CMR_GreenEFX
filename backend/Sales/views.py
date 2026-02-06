from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    Clients, Lead, Enquiry, FollowUp, LeadFollowUp,
    Service, LeadSource, LeadAttachment, LeadServiceItem,
    Quotation, QuotationItem
)
from .serializers import (
    ClientSerializer, EnquirySerializer, LeadSerializer, FollowUpSerializer, LeadFollowUpSerializer,
    ServiceSerializer, LeadSourceSerializer, LeadAttachmentSerializer, LeadServiceItemSerializer,
    QuotationSerializer, QuotationItemSerializer
)
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML, CSS

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Clients.objects.all()
    serializer_class = ClientSerializer


class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class LeadSourceViewSet(viewsets.ModelViewSet):
    queryset = LeadSource.objects.all()
    serializer_class = LeadSourceSerializer


class LeadAttachmentViewSet(viewsets.ModelViewSet):
    queryset = LeadAttachment.objects.all()
    serializer_class = LeadAttachmentSerializer

    def perform_create(self, serializer):
        # Automatically set uploaded_by to the current user
        serializer.save(uploaded_by=self.request.user)


class LeadServiceItemViewSet(viewsets.ModelViewSet):
    queryset = LeadServiceItem.objects.all()
    serializer_class = LeadServiceItemSerializer


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def perform_create(self, serializer):
        # Automatically set prepared_by to the current user
        serializer.save(prepared_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        quotation = get_object_or_404(Quotation, pk=pk)

        # Prepare context for the template
        context = {
            'quotation': quotation,
            'SITE_NAME': 'CRM StudioOps', # Or retrieve from Django settings
        }
        
        # Render HTML content from template
        html_content = render_to_string('Sales/quotation_template.html', context)
        
        # Generate PDF using WeasyPrint
        # You might want to add custom CSS here if needed, e.g., CSS(string='@page { size: A4; margin: 1cm; }')
        pdf_file = HTML(string=html_content).write_pdf()
        
        # Save the generated PDF to the model's FileField
        filename = f'quotation_{quotation.quotation_number or quotation.id}.pdf'
        quotation.pdf_file.save(filename, ContentFile(pdf_file), save=True)
        
        return Response({
            'status': 'PDF generated successfully',
            'pdf_url': quotation.pdf_file.url if quotation.pdf_file else None
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def send_quotation(self, request, pk=None):
        quotation = get_object_or_404(Quotation, pk=pk)
        if quotation.status == 'draft' or quotation.status == 'revised':
            quotation.status = 'sent'
            quotation.save()
            # Logic to send email to client with PDF
            return Response({'status': 'Quotation marked as sent and email triggered (placeholder)'}, status=status.HTTP_200_OK)
        return Response({'status': 'Cannot send quotation in current status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        quotation = get_object_or_404(Quotation, pk=pk)
        new_status = request.data.get('status')
        if new_status in [choice[0] for choice in Quotation.STATUS_CHOICES]:
            quotation.status = new_status
            quotation.save()
            return Response({'status': f'Quotation status updated to {new_status}'}, status=status.HTTP_200_OK)
        return Response({'status': 'Invalid status provided'}, status=status.HTTP_400_BAD_REQUEST)


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    # Optional: Filter leads by assigned user, source, etc.
    def get_queryset(self):
        queryset = self.queryset
        # Example: filter by assigned_to
        assigned_to_id = self.request.query_params.get('assigned_to', None)
        if assigned_to_id is not None:
            queryset = queryset.filter(assigned_to__id=assigned_to_id)
        return queryset


class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUpSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LeadFollowUpViewSet(viewsets.ModelViewSet):
    queryset = LeadFollowUp.objects.all()
    serializer_class = LeadFollowUpSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
