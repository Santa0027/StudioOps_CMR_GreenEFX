from django.apps import AppConfig


class SalesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.Sales'

    
    def ready(self):
        import apps.Sales.signals  # ensure signals are loaded
