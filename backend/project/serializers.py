from rest_framework import serializers
from .models import *

# =====================================================
# PROJECT SERIALIZER
# =====================================================
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']



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

    class Meta:
        model = ProjectStage
        fields = "__all__"


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
        fields = "__all__"


# =====================================================
# TASK ASSIGNMENT SERIALIZER
# (Who is working on which task)
# =====================================================
class ProjectTaskAssignmentSerializer(serializers.ModelSerializer):
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
# PROJECT ASSET SERIALIZER (INTERNAL)
# (Source files, previews, finals)
# =====================================================
class ProjectAssetSerializer(serializers.ModelSerializer):
    # Show uploader name
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.name",
        read_only=True
    )

    class Meta:
        model = ProjectAsset
        fields = "__all__"

        # System-managed fields
        read_only_fields = (
            "version_number",
            "created_at",
            "approved_at",
            "uploaded_by",
        )


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
    # All versions linked to this task
    versions = StageElementVersionSerializer(
        many=True,
        read_only=True
    )

    # All assets (local + cloud)
    assets = ProjectAssetSerializer(
        many=True,
        read_only=True
    )

    # Assigned team members
    assignments = ProjectTaskAssignmentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProjectStageElement
        fields = "__all__"


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
