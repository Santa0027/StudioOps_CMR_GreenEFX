import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import Group

from apps.HR_Payroll.models import (
    User,
    DepartmentOfStaff,
    Module,
    Employee,
    EmpAttendance,
    LeaveRequest,
    SalaryStructure,
    Payroll,
    Payslip,
    AuditLog,
)
from apps.Sales.models import (
    Clients,
    Enquiry,
    LeadSource,
    Service,
    Lead,
    LeadAttachment,
    LeadServiceItem,
    Quotation,
    QuotationItem,
    FollowUp,
    LeadFollowUp,
)
from apps.project.models import (
    Project,
    ProjectStageTemplate,
    ProjectStageElementTemplate,
    ProjectStage,
    ProjectStageElement,
    ProjectTaskAssignment,
    TaskComment,
    StageElementVersion,
    ProjectTimeLog,
    ProjectAsset,
    ClientReviewLog,
    VersionAuditLog,
    Package,
    PackageItem,
    FolderStructureTemplate,
    TaskStatusLog,
)
from apps.finance.models import Invoice, InvoiceItem

from model_bakery.baker import make
from model_bakery import seq
from faker import Faker
import random
from django.utils import timezone

fake = Faker()


from django.conf import settings

class Command(BaseCommand):
    help = "Seeds the database with users, employees, and minimal sales data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear all existing data before seeding.",
        )
        parser.add_argument(
            "--num_users",
            type=int,
            default=10,
            help="Number of regular users to create.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))

        if options["clear"]:
            self.clear_data()

        with transaction.atomic():
            self.create_superusers_and_groups()
            self.seed_users_and_employees(options["num_users"])
            self.seed_minimal_sales_data()

        self.stdout.write(self.style.SUCCESS("Database seeding completed!"))

    def clear_data(self):
        self.stdout.write(self.style.WARNING("Clearing existing data..."))
        # Ordered from least dependent to most dependent for creation, 
        # then reversed for deletion.
        models_to_clear = [
            # HR & Payroll
            User, DepartmentOfStaff, Module, Employee, 
            SalaryStructure, Payroll, Payslip, AuditLog, EmpAttendance, LeaveRequest,
            
            # Sales
            Clients, LeadSource, Service, Enquiry, Lead, 
            LeadAttachment, LeadServiceItem, Quotation, QuotationItem,
            
            # Project
            ProjectStageTemplate, ProjectStageElementTemplate, 
            FolderStructureTemplate, Package, PackageItem,
            Project, ProjectStage, ProjectStageElement, 
            ProjectTaskAssignment, TaskComment, StageElementVersion,
            ProjectTimeLog, ProjectAsset, ClientReviewLog, 
            VersionAuditLog, TaskStatusLog,
            
            # Finance
            Invoice, InvoiceItem
        ]

        for model in reversed(models_to_clear): # Clear in reverse order of dependency
            model.objects.all().delete()
            self.stdout.write(f"Cleared {model.__name__} data.")

        # Clear Django's auth groups as well
        Group.objects.all().delete()
        self.stdout.write(self.style.WARNING("Finished clearing data."))

    def create_superusers_and_groups(self):
        self.stdout.write("Creating superusers and groups...")
        if not User.objects.filter(email="admin@example.com").exists():
            User.objects.create_superuser(email="admin@example.com", password="adminpass", name="Admin User")
            self.stdout.write(self.style.SUCCESS("Created superuser: admin@example.com"))
        if not User.objects.filter(email="manager@example.com").exists():
            User.objects.create_superuser(email="manager@example.com", password="managerpass", name="Manager User")
            self.stdout.write(self.style.SUCCESS("Created superuser: manager@example.com"))
        if not User.objects.filter(email="staff@example.com").exists():
            User.objects.create_superuser(email="staff@example.com", password="staffpass", name="Staff User")
            self.stdout.write(self.style.SUCCESS("Created superuser: staff@example.com"))


        # Create default groups if they don't exist
        for group_name in ["Admin", "Manager", "Staff", "Client"]:
            Group.objects.get_or_create(name=group_name)
            self.stdout.write(self.style.SUCCESS(f"Ensured group '{group_name}' exists."))

    def seed_users_and_employees(self, num_users):
        self.stdout.write(f"Seeding {num_users} users and employees...")

        # Create some Departments first
        depts = ["Operations", "Sales", "Design", "Post-Production"]
        departments = []
        for d_name in depts:
            dept, _ = DepartmentOfStaff.objects.get_or_create(name=d_name)
            departments.append(dept)

        staff_group = Group.objects.get(name="Staff")

        # Regular Users + Employees
        for _ in range(num_users):
            user = make(User,
                 email=fake.unique.email(),
                 name=fake.name(),
                 phone=lambda: fake.unique.phone_number()[:12],
                 is_staff=False,
                 is_superuser=False)
            
            # Create employee profile
            make(Employee, user=user, 
                 employee_code=fake.unique.bothify(text="EMP-####"),
                 department=random.choice(departments),
                 role=staff_group,
                 date_of_joining=fake.date_between(start_date="-2y", end_date="today"))
        
        self.stdout.write(self.style.SUCCESS(f"Created {num_users} users with employee profiles."))

    def seed_minimal_sales_data(self):
        self.stdout.write("Seeding 1 Enquiry and 1 Lead...")
        
        # Ensure we have a client for the lead
        client = make(Clients, client_name=fake.company(), email=fake.unique.email())
        
        # Create 1 Enquiry
        enquiry = make(Enquiry, 
                       client_name=fake.name(), 
                       client_email=fake.email(),
                       status="new")
        
        # Create 1 Lead linked to that Enquiry
        make(Lead, enquiry=enquiry, client=client, status="open")
        
        self.stdout.write(self.style.SUCCESS("Created 1 enquiry and 1 lead."))
