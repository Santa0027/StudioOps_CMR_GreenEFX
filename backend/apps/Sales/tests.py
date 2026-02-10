from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
import os
import shutil
import datetime

from apps.HR_Payroll.models import User
from .models import (
    Clients, Enquiry, Lead, Service, LeadSource,
    LeadAttachment, LeadServiceItem, Quotation, QuotationItem
)


# Helper function to create a test user
def create_test_user(email='test@example.com', name='Test User', password='testpassword', is_staff=True, is_active=True, is_superuser=False):
    return User.objects.create_user(email=email, name=name, password=password, is_staff=is_staff, is_active=is_active, is_superuser=is_superuser)

# Helper function to create a client
def create_test_client(user, name='Test Client', email='client@example.com'):
    return Clients.objects.create(
        client_name=name, email=email, phone='1234567890', address='123 Test St', user=user
    )

# Helper function to create an enquiry
def create_test_enquiry(client_name='Test Enquiry Client', client_email='enquiry@example.com'):
    return Enquiry.objects.create(
        client_name=client_name, client_email=client_email, status='new'
    )

# Helper function to create a lead source
def create_test_lead_source(name='Website'):
    return LeadSource.objects.create(name=name)

# Helper function to create a service
def create_test_service(name='3D Animation', price='100.00'):
    return Service.objects.create(name=name, base_price=price)

# Helper function to create a lead
def create_test_lead(user, client, enquiry, lead_source):
    return Lead.objects.create(
        enquiry=enquiry,
        client=client,
        assigned_to=user,
        status='open',
        source=lead_source,
        lead_score=50,
        priority='medium',
        next_action='Call client',
        next_action_date=datetime.date(2026, 3, 1), # Use datetime.date object
        estimated_budget='5000.00'
    )

# Ensure MEDIA_ROOT is set for file uploads tests
if not hasattr(settings, 'MEDIA_ROOT'):
    settings.MEDIA_ROOT = os.path.join(settings.BASE_DIR, 'media_test')


class SalesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Corrected user creation for custom User model
        self.user = create_test_user(email='test@example.com', name='Test User')
        self.client.force_authenticate(user=self.user)

        self.admin_user = create_test_user(email='admin@example.com', name='Admin User', is_superuser=True)

        self.client_obj = create_test_client(self.user)
        self.enquiry_obj = create_test_enquiry()
        self.lead_source_obj = create_test_lead_source()
        self.service_obj = create_test_service()
        self.lead_obj = create_test_lead(self.user, self.client_obj, self.enquiry_obj, self.lead_source_obj)

        # Ensure media test directory exists
        if not os.path.exists(settings.MEDIA_ROOT):
            os.makedirs(settings.MEDIA_ROOT)

    def tearDown(self):
        # Clean up media test directory after tests
        if os.path.exists(settings.MEDIA_ROOT):
            shutil.rmtree(settings.MEDIA_ROOT)
        # Ensure that MEDIA_ROOT is cleaned up even if it's the default (though it shouldn't be for tests)
        # It's safer to only remove if it's our temporary test media root
        if str(settings.MEDIA_ROOT).endswith('media_test'):
            if os.path.exists(settings.MEDIA_ROOT):
                shutil.rmtree(settings.MEDIA_ROOT)


    # --- Service ViewSet Tests ---
    def test_create_service(self):
        url = reverse('service-list')
        data = {'name': 'Video Editing', 'description': 'Edit videos', 'base_price': '250.00'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.count(), 2) # Includes self.service_obj from setUp
        self.assertEqual(Service.objects.get(name='Video Editing').base_price, 250.00)

    def test_list_services(self):
        url = reverse('service-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Only self.service_obj initially

    # --- LeadSource ViewSet Tests ---
    def test_create_lead_source(self):
        url = reverse('leadsource-list')
        data = {'name': 'Referral', 'description': 'Client referral'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeadSource.objects.count(), 2) # Includes self.lead_source_obj

    # --- LeadAttachment ViewSet Tests ---
    def test_create_lead_attachment(self):
        url = reverse('leadattachment-list')
        small_gif = SimpleUploadedFile("file.gif", b"file_content", content_type="image/gif")
        data = {'lead': self.lead_obj.id, 'description': 'Client brief', 'file': small_gif}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeadAttachment.objects.count(), 1)
        self.assertEqual(LeadAttachment.objects.get().uploaded_by, self.user)

    def test_retrieve_lead_attachment(self):
        small_gif = SimpleUploadedFile("file.gif", b"file_content", content_type="image/gif")
        attachment = LeadAttachment.objects.create(
            lead=self.lead_obj, uploaded_by=self.user, file=small_gif, description='Test Attachment'
        )
        url = reverse('leadattachment-detail', args=[attachment.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Test Attachment')

    # --- LeadServiceItem ViewSet Tests ---
    def test_create_lead_service_item(self):
        url = reverse('leadserviceitem-list')
        data = {
            'lead': self.lead_obj.id,
            'service': self.service_obj.id,
            'quantity': 2,
            'unit_price': '100.00',
            'notes': 'Initial discussion'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeadServiceItem.objects.count(), 1)
        self.assertEqual(LeadServiceItem.objects.get().quantity, 2)

    # --- Quotation ViewSet Tests ---
    def test_create_quotation(self):
        url = reverse('quotation-list')
        data = {
            'lead': self.lead_obj.id,
            'expiry_date': '2026-04-01',
            'notes': 'Standard quotation'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Quotation.objects.count(), 1)
        self.assertEqual(Quotation.objects.get().prepared_by, self.user)

    def test_generate_pdf_quotation_action(self):
        quotation = Quotation.objects.create(
            lead=self.lead_obj, prepared_by=self.user, expiry_date=datetime.date(2026, 4, 1) # Use datetime.date
        )
        # Create an item for the quotation for PDF rendering
        QuotationItem.objects.create(
            quotation=quotation, service=self.service_obj, description='Test Service',
            quantity=1, unit_price='100.00'
        )
        url = reverse('quotation-generate-pdf', args=[quotation.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        quotation.refresh_from_db()
        self.assertIsNotNone(quotation.pdf_file)
        self.assertTrue(os.path.exists(quotation.pdf_file.path))

    def test_send_quotation_action(self):
        quotation = Quotation.objects.create(
            lead=self.lead_obj, prepared_by=self.user, expiry_date=datetime.date(2026, 4, 1), status='draft'
        )
        url = reverse('quotation-send-quotation', args=[quotation.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        quotation.refresh_from_db()
        self.assertEqual(quotation.status, 'sent')

    def test_update_quotation_status_action(self):
        quotation = Quotation.objects.create(
            lead=self.lead_obj, prepared_by=self.user, expiry_date=datetime.date(2026, 4, 1), status='draft'
        )
        url = reverse('quotation-update-status', args=[quotation.id])
        response = self.client.post(url, {'status': 'accepted'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        quotation.refresh_from_db()
        self.assertEqual(quotation.status, 'accepted')

    # --- QuotationItem ViewSet Tests ---
    def test_create_quotation_item(self):
        quotation = Quotation.objects.create(
            lead=self.lead_obj, prepared_by=self.user, expiry_date=datetime.date(2026, 4, 1)
        )
        url = reverse('quotationitem-list')
        data = {
            'quotation': quotation.id,
            'service': self.service_obj.id,
            'description': 'Custom Graphic Design',
            'quantity': 1,
            'unit_price': '500.00'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuotationItem.objects.count(), 1)
        self.assertEqual(QuotationItem.objects.get().total_price, 500.00)

    # --- Lead ViewSet Tests (for new fields) ---
    def test_update_lead_with_new_fields(self):
        url = reverse('lead-detail', args=[self.lead_obj.id])
        data = {
            'source': self.lead_source_obj.id, # Ensure it's ID for FK
            'source_campaign': 'Spring_2026',
            'lead_score': 90,
            'priority': 'high',
            'next_action': 'Finalize contract',
            'next_action_date': '2026-03-15', # Will be parsed by DRF
            'lost_reason': ''
        }
        # Only send the fields we want to update. DRF partial update handles the rest.
        response = self.client.patch(url, data, format='json') 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead_obj.refresh_from_db()
        self.assertEqual(self.lead_obj.lead_score, 90)
        self.assertEqual(self.lead_obj.priority, 'high')
        self.assertEqual(self.lead_obj.source_campaign, 'Spring_2026')
        self.assertEqual(str(self.lead_obj.next_action_date), '2026-03-15') # DateField returns date object

    def test_lead_lost_reason_update(self):
        url = reverse('lead-detail', args=[self.lead_obj.id])
        data = {
            'status': 'lost',
            'lost_reason': 'Budget constraints'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead_obj.refresh_from_db()
        self.assertEqual(self.lead_obj.status, 'lost')
        self.assertEqual(self.lead_obj.lost_reason, 'Budget constraints')
