from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.db.models import Q
from apps.HR_Payroll.models import User, Employee, DepartmentOfStaff
from django.utils import timezone
import random
import string

class Command(BaseCommand):
    help = 'Seeds the database with test users, roles, and employee profiles.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Departments
        depts = ['Production', 'Management', 'Finance', 'HR']
        dept_objs = {}
        for d_name in depts:
            dept, _ = DepartmentOfStaff.objects.get_or_create(name=d_name)
            dept_objs[d_name] = dept

        # 2. Create functional Groups (Roles)
        roles = ['Admin', 'Manager', 'Staff', 'Artist']
        group_objs = {}
        for r_name in roles:
            group, _ = Group.objects.get_or_create(name=r_name)
            group_objs[r_name] = group

        # 3. Assign Permissions to Groups
        # Admin gets everything
        all_perms = Permission.objects.all()
        group_objs['Admin'].permissions.set(all_perms)
        
        # Manager gets most things (Add, Change, View)
        manager_perms = Permission.objects.filter(
            Q(codename__contains='view') | 
            Q(codename__contains='add') | 
            Q(codename__contains='change')
        )
        group_objs['Manager'].permissions.set(manager_perms)

        # Artist gets specific permissions (Tasks, Projects, Assets - View + limited Edit)
        artist_perms = Permission.objects.filter(
            Q(content_type__app_label__in=['project', 'Sales'], codename__contains='view') |
            Q(codename__in=['add_projectasset', 'change_projectasset', 'add_taskcomment'])
        )
        group_objs['Artist'].permissions.set(artist_perms)

        # 4. Create Test Users & Employee Profiles
        test_users = [
            {
                'email': 'admin@studioops.com',
                'name': 'System Administrator',
                'role': 'Admin',
                'is_staff': True,
                'dept': 'HR'
            },
            {
                'email': 'manager@studioops.com',
                'name': 'Project Manager',
                'role': 'Manager',
                'is_staff': True,
                'dept': 'Management'
            },
            {
                'email': 'artist1@studioops.com',
                'name': 'Lead Editor',
                'role': 'Artist',
                'is_staff': False,
                'dept': 'Production'
            },
            {
                'email': 'artist2@studioops.com',
                'name': 'VFX Artist',
                'role': 'Artist',
                'is_staff': False,
                'dept': 'Production'
            }
        ]

        for u_data in test_users:
            user, created = User.objects.get_or_create(
                email=u_data['email'],
                defaults={
                    'name': u_data['name'],
                    'is_staff': u_data['is_staff'],
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('Password123!')
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {user.email}"))
            
            # Assign Group
            group = group_objs[u_data['role']]
            user.groups.add(group)

            # Create Employee Profile
            code = ''.join(random.choices(string.digits, k=4))
            Employee.objects.get_or_create(
                user=user,
                defaults={
                    'employee_code': f"EMP-{code}",
                    'role': group,
                    'department': dept_objs[u_data['dept']],
                    'date_of_joining': timezone.now().date(),
                    'is_active': True
                }
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded HR data!"))
