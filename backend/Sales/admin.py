from django.contrib import admin
from .models import Clients,Enquiry,Lead

# Register your models here.
admin.site.register(Clients)
admin.site.register(Enquiry)
admin.site.register(Lead)
