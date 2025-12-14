from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_feilds):
        if not email:
            raise ValueError("email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_feilds)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_feilds):
        extra_feilds.setdefault("is_staff", True)
        extra_feilds.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_feilds)


class DepartmentOfStaff(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_departments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_roles')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Module(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_modules')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RolePermission(models.Model):

    ACTION_CHOICES = (
        ("view", "View"),
        ("create", "Create"),
        ("edit", "Edit"),
        ("delete", "Delete"),
        ("manage", "Manage"),
    )

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="permissions")
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    allowed = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_rolepermissions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("role", "module", "action")

    def __str__(self):
        return f"{self.role} | {self.module} | {self.action}"


class User(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=60)
    phone = models.CharField(max_length=12, unique=True, null=True, blank=True)

    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(
        DepartmentOfStaff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    avatar_url = models.URLField(blank=True, null=True)

    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_user')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.name
