from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action,authentication_classes


from .models import User,DepartmentOfStaff,Role,RolePermission,Module
from .serializers import UserSerilizer,UserDepartmentSerilizer,ModuleSerializer,RoleSerializer

class UserDepartment (ModelViewSet):
    queryset = DepartmentOfStaff.objects.all()
    serializer_class = UserDepartmentSerilizer
    permission_classes=[AllowAny]
    
    
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer 
        
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer  


    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
    
    
    
class UserRole (ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes=[AllowAny]
    
    
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer 
        
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer  


    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
    
        
class ModuleViewset(ModelViewSet):
    
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]    
    
    
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer 
        
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer  


    def perform_destroy(self, instance):
        return super().perform_destroy(instance)




class UserViewset(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerilizer
    permission_classes = [IsAuthenticated]
    
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer 
        
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
        return serializer  


    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
    
    
    
