from rest_framework import serializers
from .models import User,DepartmentOfStaff,Module,Role,RolePermission


class UserSerilizer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "phone", "role", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            phone=validated_data.get('phone', None),
            role=validated_data.get('role', 'CUSTOMER')
        )
        return user



class UserDepartmentSerilizer(serializers.ModelSerializer):
    
    
    class Meta:
        model = DepartmentOfStaff
        fields = "__all__"
        


        
class ModuleSerializer(serializers.ModelSerializer):
    
    class Meta :
        model = Module
        fields = '__all__'        
        
        
        
class RoleSerializer(serializers.ModelSerializer):
    
    class Meta :
        model = Role
        fields = '__all__'            



class PermissionMatrixSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RolePermission
        fields = ['role', 'module', 'action', 'allowed']
        
        
        
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=RolePermission.objects.all(),
                fields = ["role","module","action"],
                message= "A permission already exists for this Role, Module, and Action combination."
            )
        ]    