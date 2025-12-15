from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action,authentication_classes
from rest_framework.viewsets import GenericViewSet
from django.db import transaction
from rest_framework import status

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
    permission_classes = []  # add IsAuthenticated later

    @action(detail=False, methods=["post"], url_path="update-matrix")
    def update_permission_matrix(self, request):
        serializer = self.geet_serializer(data=request.data,many=True)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        
        if not validated_data:
            return Response(
                {"details": "No permission data provided"},
                status =status.HTTP_400_BAD_REQUEST,
            )
        
        
        role = validated_data[0]['role']
        
        
        try :
            with transaction.atomic():
                existing_perems = {
                    (p.module_id , p.action):p
                    for p in RolePermission.objects.filter(role=role)
                }
                
                
                seen_key = set()
                
                for item in validated_data:
                    key = (item["module"].id,item['action'])
                    seen_key.add(key)
                    
                    if key in existing_perems:
                        perm = existing_perems[key]
                        perm.allowed = item["allowed"]
                        perm.created_by = request.user
                        perm.save()
                        
                    else:
                        RolePermission.objects.create(
                            role=role,
                            module = item["module"],
                            action= item["action"],
                            allowed=item["allowed"],
                            created_by = request.user,
                        )    
                        
                for key ,perms in existing_perems.items():
                    if key not in seen_key:
                        perms.delete()
        except Exception as e:
            return Response(
                {"details": f"permission update failed : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )             
        return Response(
            {"details": f"permission updated for the role {role.id}"},
            status=status.HTTP_200_OK
        )    
                                
                      

    @action(detail=True, methods=["get"], url_path="matrix-data")
    def get_role_permission_matrix(self, request, pk=None):
        role = get_object_or_404(Role, pk=pk)
        permissions = RolePermission.objects.filter(role=role)
        serializer = self.get_serializer(permissions, many=True)
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
    
    
    
