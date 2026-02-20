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
from datetime import timedelta
import random
from django.utils import timezone

fake = Faker()


class Command(BaseCommand):
    def ensure_media_file(self, filename):
        """Ensure a dummy file exists in the media directory."""
        media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'media')
        file_path = os.path.join(media_dir, filename)
        if not os.path.exists(file_path):
            # Choose content based on extension
            ext = filename.split('.')[-1].lower()
            content = b''
            if ext == 'pdf':
                content = b'%PDF-1.4\n%Dummy PDF file\n'
            elif ext == 'mp3':
                content = b'ID3DummyMP3'
            elif ext in ['jpeg', 'jpg']:
                content = b'\xff\xd8\xffDummyJPEG'
            elif ext == 'wav':
                content = b'RIFFDUMMYWAV'
            elif ext == 'xls':
                content = b'DummyXLS'
            elif ext == 'xlsx':
                content = b'DummyXLSX'
            elif ext == 'json':
                content = b'{}'
            elif ext == 'txt':
                content = b'Dummy text file.'
            elif ext == 'csv':
                content = b'col1,col2\n1,2\n'
            elif ext == 'css':
                content = b'body { background: #fff; }'
            elif ext == 'docx':
                content = b'DummyDOCX'
            elif ext == 'pptx':
                content = b'DummyPPTX'
            elif ext == 'xml':
                content = b'<root></root>'
            elif ext == 'gif':
                content = b'GIF89a\n'
            elif ext == 'tiff':
                content = b'DummyTIFF'
            elif ext == 'odt':
                content = b'DummyODT'
            elif ext == 'html':
                content = b'<html><body>Dummy HTML</body></html>'
            else:
                content = b'Dummy file.'
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'wb') as f:
                f.write(content)
        return filename
    help = "Seeds the database with test data for all models."

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
        parser.add_argument(
            "--num_clients",
            type=int,
            default=5,
            help="Number of clients to create.",
        )
        parser.add_argument(
            "--num_projects",
            type=int,
            default=10,
            help="Number of projects to create.",
        )
        parser.add_argument(
            "--num_enquiries",
            type=int,
            default=10,
            help="Number of enquiries to create.",
        )
        parser.add_argument(
            "--num_leads",
            type=int,
            default=5,
            help="Number of leads to create.",
        )
        parser.add_argument(
            "--num_packages",
            type=int,
            default=3,
            help="Number of packages to create.",
        )
        parser.add_argument(
            "--num_services",
            type=int,
            default=5,
            help="Number of services to create.",
        )
        parser.add_argument(
            "--num_departments",
            type=int,
            default=3,
            help="Number of departments to create.",
        )
        parser.add_argument(
            "--num_stage_templates",
            type=int,
            default=3,
            help="Number of project stage templates to create.",
        )
        parser.add_argument(
            "--num_folder_templates",
            type=int,
            default=2,
            help="Number of folder structure templates to create.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))

        if options["clear"]:
            self.clear_data()

        with transaction.atomic():
            self.create_superusers_and_groups()
            self.seed_core_hr_data(options["num_users"], options["num_departments"])
            self.seed_sales_data(
                options["num_clients"],
                options["num_enquiries"],
                options["num_leads"],
                options["num_services"],
            )
            self.seed_project_data(
                options["num_projects"],
                options["num_packages"],
                options["num_stage_templates"],
                options["num_folder_templates"],
            )
            self.seed_finance_data(options["num_clients"], options["num_projects"])
            self.seed_interconnected_data()
            self.seed_more_project_details()

        self.stdout.write(self.style.SUCCESS("Database seeding completed!"))

    def clear_data(self):
        self.stdout.write(self.style.WARNING("Clearing existing data..."))
        models_to_clear = [
            AuditLog, Payslip, Payroll, SalaryStructure, LeaveRequest, EmpAttendance,
            Employee, DepartmentOfStaff, Module, User,
            ClientReviewLog, ProjectAsset, ProjectTimeLog, StageElementVersion,
            TaskComment, ProjectTaskAssignment, ProjectStageElement, ProjectStage,
            ProjectStageElementTemplate, ProjectStageTemplate, TaskStatusLog,
            Project, PackageItem, Package, FolderStructureTemplate,
            QuotationItem, Quotation, LeadServiceItem, LeadAttachment, Lead,
            Service, LeadSource, Enquiry, Clients, InvoiceItem, Invoice
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

    def seed_core_hr_data(self, num_users, num_departments):
        self.stdout.write("Seeding core HR data (Users, Departments, Employees)...")

        # Regular Users
        make(User, _quantity=num_users,
             email=fake.email,
             name=fake.name,
             phone=lambda: fake.unique.phone_number()[:12],
             is_staff=False,
             is_superuser=False)
        self.stdout.write(self.style.SUCCESS(f"Created {num_users} regular users."))

        # Departments
        make(DepartmentOfStaff, _quantity=num_departments, name=seq(fake.unique.word()), description=fake.text())
        self.stdout.write(self.style.SUCCESS(f"Created {num_departments} departments."))

        # Modules (simple creation)
        modules = ['Sales CRM', 'Project Management', 'HR & Payroll', 'Finance', 'Reports']
        for module_name in modules:
            Module.objects.get_or_create(name=module_name, code=module_name.replace(' ', '_').upper())
        self.stdout.write(self.style.SUCCESS(f"Ensured {len(modules)} modules exist."))

        # Employees (link to existing Users and Departments)
        users_without_employee_profile = User.objects.filter(employee_profile__isnull=True, is_superuser=False)
        departments = DepartmentOfStaff.objects.all()
        staff_group = Group.objects.get(name="Staff")

        for user in users_without_employee_profile:
            if departments:
                make(Employee, user=user, employee_code=fake.unique.bothify(text="EMP-####"),
                    department=random.choice(departments), role=staff_group,
                    date_of_joining=fake.date_between(start_date="-5y", end_date="today"))
            else:
                self.stdout.write(self.style.WARNING("No departments available to assign employees."))
        self.stdout.write(self.style.SUCCESS(f"Created employees for available users."))

        # Assign managers to Employees
        managers = User.objects.filter(is_superuser=True) # Using superusers as managers for seeding
        if managers and Employee.objects.exists():
            for employee in Employee.objects.all():
                if employee.user.email == "manager@example.com":
                    employee.role = Group.objects.get(name="Manager")
                    employee.save()
                elif employee.user.email == "admin@example.com":
                    employee.role = Group.objects.get(name="Admin")
                    employee.save()
        
        self.stdout.write(self.style.SUCCESS("Assigned roles to some employees."))

        # EmpAttendance (for some employees)
        employees = Employee.objects.all()
        if employees:
            for _ in range(num_users * 5): # Create 5 attendances per user
                employee = random.choice(employees)
                date = fake.date_between(start_date="-1y", end_date="today")
                if not EmpAttendance.objects.filter(employee=employee, date=date).exists():
                    status = random.choice([choice[0] for choice in EmpAttendance.STATUS_CHOICES])
                    check_in = fake.time_object() if status == "PRESENT" else None
                    check_out = (timezone.datetime.combine(date, check_in) + timedelta(hours=random.randint(6, 9))).time() if check_in else None
                    make(EmpAttendance, employee=employee, date=date, status=status, check_in=check_in, check_out=check_out)
            self.stdout.write(self.style.SUCCESS(f"Created attendance records for employees."))
        
        # SalaryStructure, Payroll
        # SalaryStructure, Payroll
for employee in Employee.objects.all():

    salary_structure, created = SalaryStructure.objects.get_or_create(
        employee=employee,
        defaults={
            "basic": fake.pydecimal(left_digits=5, right_digits=2, positive=True),
            "hra": fake.pydecimal(left_digits=4, right_digits=2, positive=True),
            "allowance": fake.pydecimal(left_digits=4, right_digits=2, positive=True),
            "deductions": fake.pydecimal(left_digits=3, right_digits=2, positive=True),
            "effective_from": fake.date_between(start_date="-2y", end_date="today"),
        }
    )

    if created:
        self.stdout.write(f"Created salary structure for {employee.user.email}")

    # Payroll creation
    num_months = random.randint(1, 12)
    for i in range(num_months):
        month = (timezone.now().month - i - 1) % 12 + 1
        year = timezone.now().year if timezone.now().month - i > 0 else timezone.now().year - 1

        Payroll.objects.get_or_create(
            employee=employee,
            month=month,
            year=year,
            defaults={
                "gross_salary": fake.pydecimal(left_digits=5, right_digits=2, positive=True),
                "deductions": fake.pydecimal(left_digits=3, right_digits=2, positive=True),
                "net_salary": fake.pydecimal(left_digits=5, right_digits=2, positive=True),
                "is_paid": fake.boolean(),
            }
        )



    def seed_sales_data(self, num_clients, num_enquiries, num_leads, num_services):
        self.stdout.write("Seeding Sales data (Clients, Enquiries, Leads, Services)...")

        # LeadSources
        lead_sources = ['Website', 'Referral', 'Social Media', 'Advertisement', 'Cold Call']
        for source_name in lead_sources:
            LeadSource.objects.get_or_create(name=source_name, description=fake.text())
        self.stdout.write(self.style.SUCCESS(f"Ensured {len(lead_sources)} lead sources exist."))

        # Services
        make(Service, _quantity=num_services, name=seq(fake.unique.bs()), description=fake.text(),
             base_price=fake.pydecimal(left_digits=4, right_digits=2, positive=True))
        self.stdout.write(self.style.SUCCESS(f"Created {num_services} services."))

        # Clients
        users = User.objects.all()
        for _ in range(num_clients):
            client_user = random.choice(users) if users else None
            make(Clients, client_name=fake.unique.company(), email=fake.unique.email(),
                 phone=fake.unique.phone_number()[:15], address=fake.address(),
                 contact_person=fake.name(), user=client_user,
                 website=fake.url(), notes=fake.text(), status=random.choice([choice[0] for choice in Clients._meta.get_field('status').choices]))
        self.stdout.write(self.style.SUCCESS(f"Created {num_clients} clients."))

        # Enquiries
        for _ in range(num_enquiries):
            created_by_user = random.choice(users) if users else None
            assigned_to_user = random.choice(users) if users else None
            service = random.choice(Service.objects.all()) if Service.objects.exists() else None
            make(Enquiry, client_name=fake.name(), client_email=fake.email(), client_phone=fake.phone_number()[:12],
                 service_interested=service.name if service else fake.catch_phrase(), budget_range=fake.random_element(elements=('$1k-5k', '$5k-10k', '$10k+', 'Negotiable')),
                 timeline=fake.random_element(elements=('1-3 months', '3-6 months', '6-12 months')), source=fake.word(),
                 status=random.choice([choice[0] for choice in Enquiry.STATUS_CHOICES]),
                 created_by=created_by_user, assigned_to=assigned_to_user)
        self.stdout.write(self.style.SUCCESS(f"Created {num_enquiries} enquiries."))

        # Leads (from some enquiries)
        enquiries_without_leads = Enquiry.objects.filter(lead__isnull=True)
        if enquiries_without_leads and Clients.objects.exists():
            for _ in range(num_leads):
                if not enquiries_without_leads:
                    break
                enquiry = random.choice(enquiries_without_leads)
                client = random.choice(Clients.objects.all())
                assigned_to_user = random.choice(users) if users else None
                make(Lead, enquiry=enquiry, client=client, assigned_to=assigned_to_user,
                     estimated_budget=fake.pydecimal(left_digits=5, right_digits=2, positive=True),
                     expected_delivery_date=fake.date_between(start_date="today", end_date="+6m"),
                     status=random.choice([choice[0] for choice in Lead.STATUS_CHOICES]),
                     source=random.choice(LeadSource.objects.all()) if LeadSource.objects.exists() else None,
                     priority=random.choice([choice[0] for choice in Lead.PRIORITY_CHOICES]))
                enquiries_without_leads = Enquiry.objects.filter(lead__isnull=True) # Refresh queryset
            self.stdout.write(self.style.SUCCESS(f"Created {num_leads} leads."))
        else:
            self.stdout.write(self.style.WARNING("Not enough enquiries or clients to create leads."))

        # LeadServiceItems (for some leads)
        leads = Lead.objects.all()
        services = Service.objects.all()
        if leads and services:
            for lead in leads:
                num_items = random.randint(1, 3)
                for _ in range(num_items):
                    make(LeadServiceItem, lead=lead, service=random.choice(services),
                         quantity=random.randint(1, 5),
                         custom_price=fake.pydecimal(left_digits=4, right_digits=2, positive=True))
            self.stdout.write(self.style.SUCCESS("Created lead service items."))

        # Quotations
        if leads and users:
            for lead in leads:
                prepared_by_user = random.choice(users)
                make(Quotation, lead=lead, expiry_date=fake.date_between(start_date="today", end_date="+1m"),
                     total_amount=fake.pydecimal(left_digits=6, right_digits=2, positive=True),
                     status=random.choice([choice[0] for choice in Quotation.STATUS_CHOICES]),
                     prepared_by=prepared_by_user,
                     pdf_file='quotation.pdf')
            self.stdout.write(self.style.SUCCESS("Created quotations."))

        # QuotationItems
        quotations = Quotation.objects.all()
        if quotations and services:
            for quotation in quotations:
                num_items = random.randint(1, 4)
                for _ in range(num_items):
                    service = random.choice(services)
                    make(QuotationItem, quotation=quotation, service=service,
                         description=service.name if service else fake.sentence(),
                         quantity=random.randint(1, 10),
                         unit_price=service.base_price if service and service.base_price else fake.pydecimal(left_digits=3, right_digits=2, positive=True))
            self.stdout.write(self.style.SUCCESS("Created quotation items."))

    def seed_project_data(self, num_projects, num_packages, num_stage_templates, num_folder_templates):
        self.stdout.write("Seeding Project data (Projects, Stages, Elements, Packages, Folders)...")

        # ProjectStageTemplate
        make(ProjectStageTemplate, _quantity=num_stage_templates, name=seq(fake.unique.job()), description=fake.text())
        self.stdout.write(self.style.SUCCESS(f"Created {num_stage_templates} project stage templates."))

        # ProjectStageElementTemplate
        stage_templates = ProjectStageTemplate.objects.all()
        if stage_templates:
            for template in stage_templates:
                make(ProjectStageElementTemplate, _quantity=random.randint(2, 5), stage=template, name=seq(fake.unique.word()),
                     description=fake.text(), default_estimated_hours=fake.random_int(min=1, max=40))
            self.stdout.write(self.style.SUCCESS("Created project stage element templates."))

        # Packages
        make(Package, _quantity=num_packages, name=seq(fake.unique.catch_phrase()), description=fake.text(),
             price=fake.pydecimal(left_digits=5, right_digits=2, positive=True),
             frequency=random.choice([choice[0] for choice in Package.FREQUENCY_CHOICES]))
        self.stdout.write(self.style.SUCCESS(f"Created {num_packages} packages."))

        # PackageItems
        packages = Package.objects.all()
        if packages:
            for package in packages:
                make(PackageItem, _quantity=random.randint(1, 4), package=package, name=seq(fake.unique.word()),
                     quantity=fake.random_int(min=1, max=100), unit=fake.random_element(elements=('count', 'hours', 'items', 'pages')))
            self.stdout.write(self.style.SUCCESS("Created package items."))

        # FolderStructureTemplate
        folder_structures = [
            {"name": "Video Project Standard", "structure": {"Production": ["Footage", "Audio", "Graphics"], "Post-Production": ["Edit", "Sound Design", "Color Grading", "VFX"], "Delivery": ["Final Render", "Client Review"]}},
            {"name": "Design Project Basic", "structure": {"Brief": [], "Concepts": [], "Revisions": [], "Final": []}},
            {"name": "Web Development Agile", "structure": {"Discovery": [], "Design": [], "Development": ["Frontend", "Backend"], "Testing": [], "Deployment": []}},
        ]
        for fs in folder_structures[:num_folder_templates]:
            FolderStructureTemplate.objects.get_or_create(**fs)
        self.stdout.write(self.style.SUCCESS(f"Ensured {num_folder_templates} folder structure templates exist."))


        # Projects
        clients = Clients.objects.all()
        users = User.objects.all()
        services = Service.objects.all()
        packages_qs = Package.objects.all()
        folder_templates_qs = FolderStructureTemplate.objects.all()

        if clients and users:
            for _ in range(num_projects):
                client = random.choice(clients)
                created_by_user = random.choice(users)
                updated_by_user = random.choice(users)

                project_type = random.choice([choice[0] for choice in Project.PROJECT_TYPE_CHOICES])
                
                service = None
                package = None
                if project_type == "single_service" and services:
                    service = random.choice(services)
                elif project_type == "package" and packages_qs:
                    package = random.choice(packages_qs)
                
                if (project_type == "single_service" and not service) or (project_type == "package" and not package):
                    self.stdout.write(self.style.WARNING(f"Skipping project creation due to lack of {project_type} services/packages."))
                    continue

                folder_template = random.choice(folder_templates_qs) if folder_templates_qs else None

                make(Project, client=client, created_by=created_by_user, updated_by=updated_by_user,
                     name=fake.unique.catch_phrase(), description=fake.text(),
                     project_type=project_type, service=service, package=package,
                     folder_structure_template=folder_template,
                     priority=random.choice([choice[0] for choice in Project.PRIORITY_CHOICES]),
                     status=random.choice([choice[0] for choice in Project.STATUS_CHOICES]),
                     start_date=fake.date_between(start_date="-1y", end_date="today"),
                     due_date=fake.date_between(start_date="today", end_date="+1y"),
                     budget=fake.pydecimal(left_digits=6, right_digits=2, positive=True),
                     estimated_hours=fake.random_int(min=50, max=500))
            self.stdout.write(self.style.SUCCESS(f"Created {num_projects} projects."))
        else:
            self.stdout.write(self.style.WARNING("Not enough clients or users to create projects."))

        # ProjectStage and ProjectStageElement (link to existing Projects and Stage Templates)
        projects = Project.objects.all()
        stage_templates = ProjectStageTemplate.objects.all()
        element_templates = ProjectStageElementTemplate.objects.all()

        if projects and stage_templates and element_templates:
            for project in projects:
                for order, stage_template in enumerate(stage_templates):
                    project_stage = make(ProjectStage, project=project, template=stage_template, order=order,
                                         status=random.choice([choice[0] for choice in ProjectStage.status.field.choices]))
                    
                    # Create ProjectStageElements for each stage
                    elements_for_template = element_templates.filter(stage=stage_template)
                    if elements_for_template:
                        for el_order, element_template in enumerate(elements_for_template):
                            status = random.choice([choice[0] for choice in ProjectStageElement.status.field.choices])
                            make(ProjectStageElement, stage=project_stage, template=element_template, order=el_order,
                                 contribution_percentage=fake.pydecimal(left_digits=2, right_digits=2, positive=True, max_value=100),
                                 estimated_hours=element_template.default_estimated_hours or fake.random_int(min=5, max=100),
                                 actual_hours=fake.random_int(min=5, max=100) if status == "completed" else None,
                                 status=status)
                    else:
                        self.stdout.write(self.style.WARNING(f"No element templates found for stage template '{stage_template.name}'."))
            self.stdout.write(self.style.SUCCESS("Created project stages and elements."))
        else:
            self.stdout.write(self.style.WARNING("Not enough projects, stage templates or element templates to create project stages/elements."))

    def seed_finance_data(self, num_clients, num_projects):
        self.stdout.write("Seeding Finance data (Invoices, InvoiceItems)...")

        clients = Clients.objects.all()
        projects = Project.objects.all()

        if clients:
            for _ in range(num_clients * 2): # Create 2 invoices per client
                client = random.choice(clients)
                project = random.choice(projects) if projects else None
                from apps.finance.models import INVOICE_STATUS_CHOICES
                status = random.choice([choice[0] for choice in INVOICE_STATUS_CHOICES])
                
                invoice_number = fake.unique.bothify(text="INV-######")
                invoice_date = fake.date_between(start_date="-6m", end_date="today")
                due_date = invoice_date + timedelta(days=30)
                total_amount = fake.pydecimal(left_digits=6, right_digits=2, positive=True)

                invoice = make(Invoice, client=client, project=project, invoice_number=invoice_number,
                               invoice_date=invoice_date, due_date=due_date, total_amount=total_amount, status=status)
                
                # Invoice Items
                num_items = random.randint(1, 5)
                for _ in range(num_items):
                    description = fake.sentence()
                    quantity = fake.random_int(min=1, max=10)
                    unit_price = fake.pydecimal(left_digits=3, right_digits=2, positive=True)
                    total = quantity * unit_price
                    make(InvoiceItem, invoice=invoice, description=description, quantity=quantity, unit_price=unit_price, total=total)
            self.stdout.write(self.style.SUCCESS(f"Created invoices and invoice items."))
        else:
            self.stdout.write(self.style.WARNING("No clients available to create invoices."))

    def seed_interconnected_data(self):
        self.stdout.write("Seeding interconnected data (Assignments, Comments, Time Logs, Assets)...")

        users = User.objects.all()
        project_stage_elements = ProjectStageElement.objects.all()
        employees = Employee.objects.all()

        if users and project_stage_elements:
            for element in project_stage_elements:
                # ProjectTaskAssignment
                num_assignments = random.randint(0, 2)
                assigned_users = []
                for _ in range(num_assignments):
                    user = random.choice(users)
                    if user not in assigned_users:
                        make(ProjectTaskAssignment, task=element, user=user, role=fake.job())
                        assigned_users.append(user)
                
                # TaskComment
                num_comments = random.randint(0, 3)
                for _ in range(num_comments):
                    make(TaskComment, task=element, user=random.choice(users), comment=fake.paragraph())
                
                # ProjectTimeLog
                num_time_logs = random.randint(0, 2)
                for _ in range(num_time_logs):
                    make(ProjectTimeLog, task=element, user=random.choice(users),
                         hours_spent=fake.pydecimal(left_digits=1, right_digits=2, positive=True, max_value=8),
                         note=fake.sentence())

                # AuditLog (for some HR actions)
                if employees.exists():
                    employee = random.choice(employees)
                    if random.random() < 0.3: # 30% chance
                        action = random.choice([choice[0] for choice in AuditLog.ACTION_CHOICES])
                        make(AuditLog, entity_type="Employee", entity_id=employee.id, entity_name=employee.user.name,
                             action=action, performed_by=random.choice(users), ip_address=fake.ipv4())

            self.stdout.write(self.style.SUCCESS("Created assignments, comments, time logs, and some audit logs."))
        else:
            self.stdout.write(self.style.WARNING("Not enough users or project stage elements to seed interconnected data."))

        # ProjectAsset
        if project_stage_elements and users:
            for element in project_stage_elements:
                num_assets = random.randint(0, 2)
                for _ in range(num_assets):
                    asset_type = random.choice([choice[0] for choice in ProjectAsset.ASSET_TYPE_CHOICES])
                    asset_role = random.choice([choice[0] for choice in ProjectAsset.ASSET_ROLE_CHOICES])
                    dummy_files = [
                        'dummy.pdf', 'dummy.mp3', 'dummy.jpeg', 'dummy.wav', 'dummy.xls', 'dummy.json',
                        'dummy.txt', 'dummy.csv', 'dummy.css', 'dummy.docx', 'dummy.pptx', 'dummy.xlsx',
                        'dummy.xml', 'dummy.gif', 'dummy.tiff', 'dummy.odt', 'quotation.pdf', 'payslip_dummy.pdf',
                        'campaign.gif', 'prevent.html'
                    ]
                    file = random.choice(dummy_files)
                    file = self.ensure_media_file(file)
                    make(ProjectAsset, element=element, uploaded_by=random.choice(users),
                         asset_type=asset_type, asset_role=asset_role,
                         file=file,
                         description=fake.sentence(),
                         client_review=fake.boolean())
            self.stdout.write(self.style.SUCCESS("Created project assets."))

    def seed_more_project_details(self):
        self.stdout.write("Seeding more project details (ClientReviewLog, VersionAuditLog, TaskStatusLog, Payslip)...")

        users = User.objects.all()
        project_assets = ProjectAsset.objects.all()
        stage_element_versions = StageElementVersion.objects.all()
        project_stage_elements = ProjectStageElement.objects.all()
        payrolls = Payroll.objects.all()


        if project_assets and users:
            for asset in project_assets:
                if asset.client_review and random.random() < 0.7: # 70% chance to have a review log
                    make(ClientReviewLog, asset=asset, reviewed_by=random.choice(users),
                         review_notes=fake.paragraph(), approved=fake.boolean())
            self.stdout.write(self.style.SUCCESS("Created client review logs."))

        if stage_element_versions and users:
            for version in stage_element_versions:
                if random.random() < 0.5: # 50% chance to have an audit log
                    action = random.choice([choice[0] for choice in VersionAuditLog.ACTION_CHOICES])
                    make(VersionAuditLog, version=version, action=action,
                         notes=fake.sentence(), performed_by=random.choice(users))
            self.stdout.write(self.style.SUCCESS("Created version audit logs."))
        
        if project_stage_elements and users:
            for element in project_stage_elements:
                if random.random() < 0.6: # 60% chance to have status changes
                    old_status = random.choice([choice[0] for choice in ProjectStageElement.status.field.choices])
                    new_status = random.choice([choice[0] for choice in ProjectStageElement.status.field.choices if choice[0] != old_status])
                    make(TaskStatusLog, task=element, user=random.choice(users), old_status=old_status, new_status=new_status)
            self.stdout.write(self.style.SUCCESS("Created task status logs."))

        if payrolls:
            for payroll in payrolls:
                if random.random() < 0.5: # 50% chance to have a payslip
                    file = self.ensure_media_file('payslip_dummy.pdf')
                    make(Payslip, payroll=payroll, file=file)
            self.stdout.write(self.style.SUCCESS("Created payslips."))

        self.stdout.write(self.style.SUCCESS("Finished seeding more project details."))
