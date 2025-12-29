from celery import shared_task
from .models import Employee
from .services.payroll import calculate_payroll

@shared_task
def run_monthly_payroll(month, year, admin_user_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    admin_user = User.objects.get(id=admin_user_id)

    for employee in Employee.objects.all():
        try:
            calculate_payroll(employee, month, year, admin_user)
        except Exception as e:
            print(f"Payroll failed for {employee.id}: {e}")
