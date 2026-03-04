from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False) # Include ID for updates

    class Meta:
        model = InvoiceItem
        fields = ('id', 'invoice', 'description', 'quantity', 'unit_price', 'total')
        read_only_fields = ('invoice',)

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True) # Remove read_only=True
    payments = PaymentSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.client_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)

        if items_data is not None:
            # Simple approach: delete existing items and recreate
            # Or a more complex one: update existing, create new, delete missing
            instance.items.all().delete()
            for item_data in items_data:
                item_data.pop('id', None) # Remove ID if present during recreation
                InvoiceItem.objects.create(invoice=instance, **item_data)
        
        return instance
