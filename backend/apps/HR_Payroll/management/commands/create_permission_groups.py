from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group,Permission
from django.apps import apps



class Command(BaseCommand):


    def handle(self, *args, **options):




        for model in apps.get_models():

            app_label = model._meta.app_label
            model_name = model._meta.model_name


            group_name = f"{app_label}_{model.__name__}"


            group , created = Group.objects.get_or_create(name = group_name)


            permissions = Permission.objects.filter(
                content_type__app_label = app_label,
                content_type__model = model_name
            )

            group.permissions.set(permissions)

            self.stdout.write(
                self.style.SUCCESS(f"Updated group : {group_name}")
            )









        return 
 