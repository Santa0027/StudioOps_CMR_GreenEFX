from django.apps import AppConfig


class HR_PayrollConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'HR_Payroll'

    
    
    # def ready(self):
    #     import signals.audit