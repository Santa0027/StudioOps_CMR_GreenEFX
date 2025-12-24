from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
    Group,
)
from django.core.serializers.json import DjangoJSONEncoder



from django.core.serializers.json import DjangoJSONEncoder


from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("date_joined", timezone.now())

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)





class DepartmentOfStaff(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_departments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name






class Module(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_modules",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name





class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=60)
    phone = models.CharField(max_length=12, unique=True, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_by = models.ForeignKey(
    "self",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="created_users",
    )
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.name





class Employee(models.Model):
    user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="employee_profile"
)

    role = models.ForeignKey(
        Group,                     # ✅ Django Group = Role
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )
    department = models.ForeignKey(
        DepartmentOfStaff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
  

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} ({self.role})"


    
    


class AuditLog(models.Model):
    
    
    
    
    ACTION_CHOICES = (
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
        ("ACTIVATE", "Activate"),
        ("DEACTIVATE", "Deactivate"),
    )
    
    
    entity_type = models.CharField(max_length=100)
    entity_id = models.PositiveIntegerField(null=True,blank=True)
    entity_name = models.CharField(max_length=255,blank=True,null=True)
    
    action = models.CharField(max_length=20,choices=ACTION_CHOICES)
    
    
    old_data = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True)
    new_data = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True)
    
    
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="audit_logs")
    
    
    performed_at = models.DateTimeField(auto_now_add=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.entity_name} |{self.action} | {self.performed_at}"