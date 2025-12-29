from hrpayroll.models import (
    EmployeeAttendance,
    Payroll
)

def calculate_payroll(employee, month, year, admin_user):
    attendances = EmployeeAttendance.objects.filter(
        employee=employee,
        date__month=month,
        date__year=year
    )

    total_days = attendances.count()
    if total_days == 0:
        raise ValueError("No attendance records found")

    present_days = attendances.filter(status="PRESENT").count()
    absent_days = attendances.filter(status="ABSENT").count()

    salary = employee.salary
    per_day_salary = salary.total_salary() / total_days

    gross = salary.total_salary()
    deduction = absent_days * per_day_salary
    net = gross - deduction - salary.pf - salary.esi - salary.tax

    return Payroll.objects.create(
        employee=employee,
        month=month,
        year=year,
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        gross_salary=gross,
        deductions=deduction,
        net_salary=net,
        generated_by=admin_user
    )
