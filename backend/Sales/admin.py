from django.contrib import admin
from .models import Clients,Enquiry,Lead,Quotation,QuotationItem,LeadServiceItem,Service

# Register your models here.
admin.site.register(Clients)
admin.site.register(Enquiry)
admin.site.register(Lead)
admin.site.register(Quotation)
admin.site.register(LeadServiceItem)
admin.site.register(QuotationItem)
admin.site.register(Service)