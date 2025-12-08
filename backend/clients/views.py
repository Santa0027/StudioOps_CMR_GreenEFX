from rest_framework import viewsets
from .models import Clients
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Clients.objects.all()
    serializer_class = ClientSerializer
