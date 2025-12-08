from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_feilds):
        if not email:
            raise ValueError("email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_feilds)
        user.set_password(password)
        user.save()
        return user

    def createsuperuser(self, email, password=None, **extra_feilds):
        extra_feilds.setdefault("is_staff", True)
        extra_feilds.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_feilds)


class DepartmentOfStaff(models.Model):
    Department = models.CharField(unique=True, null=False, blank=False, default=" ")
    Discriptions = models.CharField(max_length=50, null=True, blank=True)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(null=False, blank=False, max_length=60, default="")
    phone = models.CharField(max_length=12, unique=True, null=True, blank=True)  # Modified: null=True, blank=True
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    Department = models.ForeignKey(
        DepartmentOfStaff, on_delete=models.SET_NULL, null=True, blank=True, related_name="staff_users"
    )
    avatar_url = models.URLField(max_length=200, null=True, blank=True)  # New field

    # Personal Details
    date_of_birth = models.DateField(null=True, blank=True)  # New field
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]
    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, null=True, blank=True
    )  # New field
    highest_qualification = models.CharField(
        max_length=100, null=True, blank=True
    )  # New field
    certifications = models.TextField(null=True, blank=True)  # New field

    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("MANAGER", "Manager"),
        ("STAFF", "Staff"),
        ("CUSTOMER", "Customer"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CUSTOMER")

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="usermanagement_user_groups",
        blank=True,
        help_text=(
            "The groups this user belongs to. A user will get all permissions" "granted to each of their groups."
        ),
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="usermanagement_user_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ("name", "phone", "Department", "address", "city", "state", "zip_code")

    def __str__(self):
        return self.name
