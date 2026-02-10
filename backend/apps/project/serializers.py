from rest_framework import serializers
from .models import *
from apps.HR_Payroll.models import User
from django.db.models import Sum
from django.conf import settings # Import settings
from .utils.storages import generate_s3_presigned_url # Import for S3 presigned URL generation


# =====================================================
# PROJECT SERIALIZER
# =====================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

# =====================================================
# PROJECT STAGE ELEMENT SERIALIZER
# (Tasks inside a stage)
# =====================================================
class ProjectStageElementSerializer(serializers.ModelSerializer):
    # Display task template name
    template_name = serializers.CharField(
        source="template.name",
        read_only=True
    )

    class Meta:
        model = ProjectStageElement
        fields = [
            'id', 'template_name', 'stage', 'template', 'order', 'contribution_percentage', 
            'estimated_hours', 'actual_hours', 'status', 'initial_notes', 'rejection_notes'
        ]


# =====================================================
# PROJECT STAGE SERIALIZER
# (Pre-Production, Editing, Effects, etc.)
# =====================================================
class ProjectStageSerializer(serializers.ModelSerializer):
    # Display stage template name (instead of only ID)
    template_name = serializers.CharField(
        source="template.name",
        read_only=True
    )
    elements = ProjectStageElementSerializer(many=True, read_only=True) # Add nested elements
    stage_progress = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = ProjectStage
        fields = [
            'id', 'project', 'template', 'template_name', 'order', 'status', 'rejection_notes', 'elements', 'stage_progress'
        ]


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.client_name', read_only=True)
    assigned_users = serializers.SerializerMethodField()
    created_by_details = UserSerializer(source='created_by', read_only=True)
    stages = ProjectStageSerializer(many=True, read_only=True) # Add nested stages
    overall_progress = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    # New fields for service and package names
    service_name = serializers.CharField(source='service.name', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    folder_structure_template_name = serializers.CharField(source='folder_structure_template.name', read_only=True)


    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'client', 'client_name', 'project_type', 
            'service', 'service_name', 'package', 'package_name', 'priority', 'status', 'start_date', 'due_date', 
            'end_date', 'budget', 'estimated_hours', 'initial_requirements', 
            'reference_links', 'created_by', 'created_by_details', 'updated_by', 'created_at', 
            'updated_at', 'assigned_users', 'overall_progress', 'stages', 'folder_structure_template', 'folder_structure_template_name' # Include stages in fields
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def get_assigned_users(self, obj):
        # Get all users assigned to tasks in this project
        tasks = ProjectStageElement.objects.filter(stage__project=obj)
        user_ids = ProjectTaskAssignment.objects.filter(task__in=tasks).values_list('user_id', flat=True).distinct()
        users = User.objects.filter(id__in=user_ids)
        return UserSerializer(users, many=True).data



# =====================================================
# TASK ASSIGNMENT SERIALIZER
# (Who is working on which task)
# =====================================================
class ProjectTaskAssignmentSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(
        queryset=ProjectStageElement.objects.all()
    )
    # Expose assigned user name
    user_name = serializers.CharField(
        source="user.name",
        read_only=True
    )

    class Meta:
        model = ProjectTaskAssignment
        fields = "__all__"


# =====================================================
# TIME LOG SERIALIZER
# (Hours logged by users)
# =====================================================
class ProjectTimeLogSerializer(serializers.ModelSerializer):
    # Expose user name for UI
    user_name = serializers.CharField(
        source="user.name",
        read_only=True
    )

    class Meta:
        model = ProjectTimeLog
        fields = "__all__"


# =====================================================
# STAGE ELEMENT VERSION SERIALIZER
# (Internal + client versions of work)
# =====================================================
class StageElementVersionSerializer(serializers.ModelSerializer):
    # Display creator name
    created_by_name = serializers.CharField(
        source="created_by.name",
        read_only=True
    )

    class Meta:
        model = StageElementVersion
        fields = "__all__"

        # Auto-generated fields
        read_only_fields = (
            "version_number",
            "created_at",
            "created_by",
        )


# =====================================================
# PROJECT ASSET UPLOAD SERIALIZER
# (For uploading new asset files to a stage element)
# =====================================================
class ProjectAssetUploadSerializer(serializers.ModelSerializer):
    asset_type = serializers.ChoiceField(choices=ProjectAsset.ASSET_TYPE_CHOICES)
    asset_role = serializers.ChoiceField(choices=ProjectAsset.ASSET_ROLE_CHOICES)

    class Meta:
        model = ProjectAsset
        fields = (
            "file",
            "asset_type",
            "asset_role",
            "description", # Allow description on upload
        )
        extra_kwargs = {
            'file': {'required': True},
        }

    def create(self, validated_data):
        # The 'element' will be passed by the view, not directly in validated_data
        element = self.context.get('element')
        if not element:
            raise serializers.ValidationError("Element not provided in serializer context.")
        
        return ProjectAsset.objects.create(element=element, **validated_data)


# =====================================================
# PROJECT ASSET SERIALIZER (INTERNAL)
# (Source files, previews, finals)
# =====================================================
class ProjectAssetSerializer(serializers.ModelSerializer):
    # Show uploader name
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.name",
        read_only=True
    )
    # Explicitly define file field to ensure it returns full URL
    file = serializers.SerializerMethodField()

    class Meta:
        model = ProjectAsset
        fields = '__all__'

        # System-managed fields
        read_only_fields = (
            "version_number",
            "created_at",
            "approved_at",
            "uploaded_by",
        )

    def get_file(self, obj):
        if obj.file:
            request = self.context.get('request')
            if obj.storage_location == 'cloud':
                return generate_s3_presigned_url(obj.file.name)

            elif obj.storage_location == 'nas':
                if request:
                    # Construct absolute URL using NAS_MEDIA_URL
                    # obj.file returns a StorageFile object which can be cast to string for its name
                    return request.build_absolute_uri(settings.NAS_MEDIA_URL + str(obj.file))
                return settings.NAS_MEDIA_URL + str(obj.file) # Fallback if request context is not available

            elif obj.storage_location == 'local':
                if request:
                    return request.build_absolute_uri(obj.file.url)
                return obj.file.url # Fallback if request context is not available

            return obj.file.url # Default fallback
        return None


# =====================================================
# CLIENT ASSET SERIALIZER
# (Only what client is allowed to see)
# =====================================================
class ClientProjectAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAsset

        # Limited safe fields for client
        fields = (
            "id",
            "asset_role",       # preview / final
            "file",             # streamed asset
            "version_number",
            "description",
            "created_at",
        )


# =====================================================
# CLIENT REVIEW LOG SERIALIZER
# (Client approvals / rejections)
# =====================================================
class ClientReviewLogSerializer(serializers.ModelSerializer):
    # Display reviewer name
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.name",
        read_only=True
    )

    class Meta:
        model = ClientReviewLog
        fields = "__all__"

        # Review timestamp is system-generated
        read_only_fields = ("reviewed_at",)



# =====================================================
# STAGE ELEMENT DETAIL SERIALIZER (INTERNAL)
# (Full deep view with relations)
# =====================================================
class ProjectStageElementDetailSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="stage.project.name",
        read_only=True
    )
    template_name = serializers.CharField(
        source="template.name",
        read_only=True
    )
    versions = StageElementVersionSerializer(
        many=True,
        read_only=True
    )
    assets = ProjectAssetSerializer(
        many=True,
        read_only=True
    )
    assignments = ProjectTaskAssignmentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProjectStageElement
        fields = [
            'id', 'stage', 'template', 'order', 'contribution_percentage',
            'estimated_hours', 'actual_hours', 'status', 'rejection_notes',
            'project_name', 'template_name', 'versions', 'assets', 'assignments'
        ]


# =====================================================
# CLIENT STAGE ELEMENT SERIALIZER
# (Client-safe task view)
# =====================================================
class ClientProjectStageElementSerializer(serializers.ModelSerializer):
    # Client can see only client-review assets
    assets = ClientProjectAssetSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProjectStageElement

        # Minimal task data exposed to client
        fields = (
            "id",
            "status",
            "rejection_notes",
            "assets",
        )

# =====================================================
# PACKAGE SERIALIZERS
# =====================================================

class PackageItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackageItem
        # Explicitly list fields, omitting 'package' as it's set by the parent PackageSerializer
        fields = ['id', 'name', 'quantity', 'unit']
        read_only_fields = ['id']

class PackageSerializer(serializers.ModelSerializer):
    items = PackageItemSerializer(many=True, read_only=False) # Allow nested creation/update

    class Meta:
        model = Package
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        package = Package.objects.create(**validated_data)
        for item_data in items_data:
            PackageItem.objects.create(package=package, **item_data)
        return package

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update package fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create package items
        if items_data is not None:
            # Clear existing items and create new ones (simplistic approach)
            instance.items.all().delete()
            for item_data in items_data:
                PackageItem.objects.create(package=instance, **item_data)

        return instance

# =====================================================
# PROJECT STAGE TEMPLATE SERIALIZERS
# =====================================================

class ProjectStageElementTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStageElementTemplate
        fields = ['id', 'name', 'description', 'default_estimated_hours'] # Explicitly list fields, omitting 'stage'
        read_only_fields = ['id']

class ProjectStageTemplateSerializer(serializers.ModelSerializer):
    task_templates = ProjectStageElementTemplateSerializer(many=True, read_only=False) # Nested serializer for elements

    class Meta:
        model = ProjectStageTemplate
        fields = '__all__'
        read_only_fields = ['id']

    def create(self, validated_data):
        task_templates_data = validated_data.pop('task_templates', [])
        stage_template = ProjectStageTemplate.objects.create(**validated_data)
        for template_data in task_templates_data:
            ProjectStageElementTemplate.objects.create(stage=stage_template, **template_data)
        return stage_template

    def update(self, instance, validated_data):
        task_templates_data = validated_data.pop('task_templates', None)

        # Update ProjectStageTemplate fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create ProjectStageElementTemplates
        if task_templates_data is not None:
            # Simplistic: delete existing and recreate. More robust would be to diff.
            instance.task_templates.all().delete()
            for template_data in task_templates_data:
                ProjectStageElementTemplate.objects.create(stage=instance, **template_data)

        return instance

# =====================================================
# FOLDER STRUCTURE TEMPLATE SERIALIZERS
# =====================================================

class FolderStructureTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolderStructureTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

# =====================================================
# TASK COMMENT SERIALIZER
# =====================================================
class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = TaskComment
        fields = ["id", "task", "user", "user_name", "comment", "created_at"]
        read_only_fields = ["id", "task", "user", "user_name", "created_at"]

