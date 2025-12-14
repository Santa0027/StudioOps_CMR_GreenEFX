from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action,authentication_classes
from rest_framework.viewsets import GenericViewSet
from django.db import transaction

from django.shortcuts import get_list_or_404,get_object_or_404

from .models import User,DepartmentOfStaff,Role,RolePermission,Module
from .serializers import UserSerilizer,UserDepartmentSerilizer,ModuleSerializer,RoleSerializer,PermissionMatrixSerializer

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



class RolePermissionManagerViewset(GenericViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = PermissionMatrixSerializer
    permission_classes = [AllowAny]
    
    
    @action(detail=False , methods=["post"],url_path='update-matrix')
    def update_permission_matrix(self, request):
        
        
        
        data = request.data
        serializer = self.get_serializer(data =data , many = True)
        serializer.is_valid(raise_exception= True)
        
        
        validated_data = self.get_serializer.validated_data
        
        if not validated_data :
            return Response({"details" : "No permission data provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        
        role_id = validated_data[0]['role'].id
        
        
        
        try:
            with transaction.atomic():
                RolePermission.objects.filter(role_id=role_id).delete()
                
                
                
                
                permission_to_create = []
                
                for item in validated_data:
                    
                    
                    permission_to_create.append(
                        RolePermission(
                            role = item['role'],
                            module = item['module'],
                            permission = item['permission'],
                            allowed = item ['allowed'],
                            created_by = self.request.user
                        )
                    )
                    
                RolePermission.objects.bulk_create(permission_to_create)    
                
                
        except Exception as e :
            return Response({"detials" : f"an error aquired while bulk update :{e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERRORS)
                  
                    
        
        return Response({"details" : f" the permission for the {role_id} is successfully created "},status=status.HTTP_200_OK)    
            

    
    @action(detail=True, methods=["get"] , url_path='matrix-data')
    def get_role_permission_matrix (self, request , pk = None):
        
        role = get_object_or_404(Role ,pk=pk)
        
        
        
        permission = RolePermission.objects.filter(role=role)
        
        
        serializer = PermissionMatrixSerializer(permission , many=True)
        
        
        return Response(serializer.data)
        











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
    
    
    
