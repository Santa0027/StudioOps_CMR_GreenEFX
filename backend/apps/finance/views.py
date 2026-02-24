from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Invoice, InvoiceItem, Payment
from .serializers import InvoiceSerializer, InvoiceItemSerializer, PaymentSerializer

class IsFinanceManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_staff or 
            request.user.groups.filter(name__in=['Admin', 'Manager']).exists()
        )

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('client', 'project').prefetch_related('items', 'payments').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsFinanceManager]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_invoiced = Invoice.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_paid = Invoice.objects.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
        total_pending = total_invoiced - total_paid
        
        return Response({
            "total_invoiced": total_invoiced,
            "total_paid": total_paid,
            "total_pending": total_pending,
            "count": Invoice.objects.count()
        })

class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsFinanceManager]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice', 'invoice__client').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsFinanceManager]

    def perform_create(self, serializer):
        payment = serializer.save()
        # Update invoice paid amount and status
        invoice = payment.invoice
        total_paid = invoice.payments.aggregate(Sum('amount'))['amount__sum'] or 0
        invoice.paid_amount = total_paid
        
        if invoice.paid_amount >= invoice.total_amount:
            invoice.status = "Paid"
        elif invoice.paid_amount > 0:
            invoice.status = "Partial"
        
        invoice.save()