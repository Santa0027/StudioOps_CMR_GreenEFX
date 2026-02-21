from rest_framework import serializers
from .models import *
from apps.HR_Payroll.models import User
from django.db.models import Sum
from django.conf import settings # Import settings
from .utils.storages import generate_s3_presigned_url # Import for S3 presigned URL generation


# =====================================================
# USER SERIALIZER
# =====================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

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
        fields = ['id', 'task', 'user', 'user_name', 'role', 'initial_notes', 'assigned_at']


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
        fields = (
            "id", "element", "uploaded_by", "uploaded_by_name", "asset_type",
            "asset_role", "file", "storage_location", "relative_path",
            "client_review", "version_number", "description", "processed",
            "relative_path", # Added relative_path
            "created_at", "approved_at",
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
# PROJECT STAGE ELEMENT SERIALIZER
# (Tasks inside a stage)
# =====================================================
class ProjectStageElementSerializer(serializers.ModelSerializer):
    # Display task template name
    template_name = serializers.CharField(
        source="template.name",
        read_only=True
    )
    manager_approved_by_name = serializers.CharField(source='manager_approved_by.name', read_only=True)
    client_approved_by_name = serializers.CharField(source='client_approved_by.name', read_only=True)


    class Meta:
        model = ProjectStageElement
        fields = [
            'id', 'template_name', 'stage', 'template', 'order', 'contribution_percentage', 
            'estimated_hours', 'actual_hours', 'status', 'initial_notes', 'rejection_notes',
            'manager_approval_status', 'manager_rework_notes', 'manager_approved_by', 'manager_approved_by_name', 'manager_approved_at',
            'client_approval_status', 'client_rework_notes', 'client_approved_by', 'client_approved_by_name', 'client_approved_at',
            'staged_for_client_review',
        ]
        read_only_fields = ['manager_approved_by', 'manager_approved_at', 'client_approved_by', 'client_approved_at']

    def validate_status(self, value):
        if self.instance:  # If updating an existing instance
            old_status = self.instance.status
            new_status = value
            # Create a dummy instance to call the model's validation method
            temp_instance = ProjectStageElement(status=old_status)
            try:
                temp_instance.validate_status_transition(old_status, new_status)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        else:  # If creating a new instance
            # For a new task, only 'pending' or 'in_progress' are typically valid initial statuses
            if value not in ["pending", "in_progress"]:
                raise serializers.ValidationError(
                    f"Invalid initial status '{value}' for a new task. Must be 'pending' or 'in_progress'."
                )
        return value

    def validate(self, data):
        # Retrieve existing instance if available
        instance = self.instance

        # Validate contribution_percentage range
        contribution_percentage = data.get('contribution_percentage')
        if contribution_percentage is not None:
            if not (0 < contribution_percentage <= 100):
                raise serializers.ValidationError(
                    {"contribution_percentage": "Contribution must be between 0 and 100."}
                )
        
        # Conditional validation for rejection_notes
        status = data.get('status', instance.status if instance else None)
        if status == 'rejected':
            rejection_notes = data.get('rejection_notes', instance.rejection_notes if instance else None)
            if not rejection_notes or rejection_notes.strip() == '':
                raise serializers.ValidationError(
                    {"rejection_notes": "Rejection notes are required when status is 'Rejected'."}
                )

        # Manager Approval Status Validation
        manager_approval_status = data.get('manager_approval_status', instance.manager_approval_status if instance else "pending")
        if manager_approval_status == 'rejected':
            manager_rework_notes = data.get('manager_rework_notes', instance.manager_rework_notes if instance else None)
            if not manager_rework_notes or manager_rework_notes.strip() == '':
                raise serializers.ValidationError(
                    {"manager_rework_notes": "Manager rework notes are required when manager approval status is 'Rejected'."}
                )
        
        # Client Approval Status Validation
        client_approval_status = data.get('client_approval_status', instance.client_approval_status if instance else "not_applicable")
        if client_approval_status == 'rejected':
            client_rework_notes = data.get('client_rework_notes', instance.client_rework_notes if instance else None)
            if not client_rework_notes or client_rework_notes.strip() == '':
                raise serializers.ValidationError(
                    {"client_rework_notes": "Client rework notes are required when client approval status is 'Rejected'."}
                )

        # Ensure manager_approved_by is set when manager_approval_status is 'approved'
        if manager_approval_status == 'approved' and not data.get('manager_approved_by'):
            if instance and not instance.manager_approved_by: # Only if it's not already set in the instance
                raise serializers.ValidationError(
                    {"manager_approved_by": "Manager who approved must be provided when manager_approval_status is 'approved'."}
                )

        # Ensure client_approved_by is set when client_approval_status is 'approved'
        if client_approval_status == 'approved' and not data.get('client_approved_by'):
            if instance and not instance.client_approved_by: # Only if it's not already set in the instance
                raise serializers.ValidationError(
                    {"client_approved_by": "Client who approved must be provided when client_approval_status is 'approved'."}
                )

        # A task can only be completed if both manager and client (if applicable) have approved.
        if status == 'completed':
            if manager_approval_status != 'approved':
                raise serializers.ValidationError(
                    {"status": "Task cannot be completed without manager approval."}
                )
            if client_approval_status not in ['not_applicable', 'approved']:
                raise serializers.ValidationError(
                    {"status": "Task cannot be completed without client approval when client review is applicable."}
                )
        
        # Handle automatic transition for staged_for_client_review
        staged_for_client_review = data.get('staged_for_client_review', instance.staged_for_client_review if instance else False)
        if staged_for_client_review and not (instance and instance.staged_for_client_review): # If it's being set to True
            if manager_approval_status != 'approved':
                raise serializers.ValidationError(
                    {"staged_for_client_review": "Task cannot be staged for client review without manager approval."}
                )
            # Automatically set client_approval_status to "requested"
            data['client_approval_status'] = "requested"
            data['status'] = "waiting_client_review" # Also transition main status

        # If client approval is requested (e.g., manually set), ensure it's staged
        if data.get('client_approval_status') == 'requested' and not staged_for_client_review:
            # Check if client_approval_status is *being changed* to 'requested'
            old_client_approval_status = instance.client_approval_status if instance else "not_applicable"
            if data.get('client_approval_status') != old_client_approval_status: # Only validate if status is actually changing
                raise serializers.ValidationError(
                    {"staged_for_client_review": "Task must be staged for client review when client approval is requested."}
                )

        return data


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
# PROJECT STAGE ELEMENT DETAIL SERIALIZER (INTERNAL)
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
    manager_approved_by_name = serializers.CharField(source='manager_approved_by.name', read_only=True)
    client_approved_by_name = serializers.CharField(source='client_approved_by.name', read_only=True)


    class Meta:
        model = ProjectStageElement
        fields = [
            'id', 'stage', 'template', 'order', 'contribution_percentage',
            'estimated_hours', 'actual_hours', 'status', 'rejection_notes',
            'manager_approval_status', 'manager_rework_notes', 'manager_approved_by', 'manager_approved_by_name', 'manager_approved_at',
            'client_approval_status', 'client_rework_notes', 'client_approved_by', 'client_approved_by_name', 'client_approved_at',
            'staged_for_client_review',
            'project_name', 'template_name', 'versions', 'assets', 'assignments'
        ]


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
# PROJECT STAGE SERIALIZER
# =====================================================
class ProjectStageSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    elements = ProjectStageElementSerializer(many=True, read_only=True) # Nested elements

    class Meta:
        model = ProjectStage
        fields = [
            'id', 'project', 'template', 'template_name', 'order', 'status', 
            'rejection_notes', 'stage_progress', 'elements'
        ]
        read_only_fields = ['id', 'stage_progress']

# =====================================================
# PROJECT SERIALIZER
# =====================================================

class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.client_name', read_only=True)
    assigned_user_details = serializers.SerializerMethodField(read_only=True)
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
            'updated_at', 'assigned_users', 'assigned_user_details', 'overall_progress', 'stages', 
            'folder_structure_template', 'folder_structure_template_name' 
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def get_assigned_user_details(self, obj):
        # Get users directly assigned to the project
        return UserSerializer(obj.assigned_users.all(), many=True).data


# =====================================================
# TIME LOG SERIALIZER
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
            # Simplistic: delete existing and recreate. More robust would be to diff.
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




class StorageSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageSetting
        fields = '__all__'
        

