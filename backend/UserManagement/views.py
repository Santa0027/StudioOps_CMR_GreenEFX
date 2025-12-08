from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action,authentication_classes


from .models import User
from .serializers import UserSerilizer



class UserViewset(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerilizer
    permission_classes = [IsAuthenticated]