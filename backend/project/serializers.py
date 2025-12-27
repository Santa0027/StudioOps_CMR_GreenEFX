from rest_framework import serializers
from .models import (
    Project,
    ProjectStageTemplate,
    ProjectStageElementTemplate,
    ProjectStage,
    ProjectStageElement,
    ProjectTaskAssignment,
    StageElementVersion,
    ProjectTimeLog,
    ProjectAttachment,
)
from HR_Payroll.models import User
from Sales.models import Clients


from HR_Payroll.serializers import UserSerializer
from Sales.serializers import ClientSerializer

# class UserMiniSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "name", "email"]


# class ClientMiniSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Clients
#         fields = ["id", "name"]







class ProjectStageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStageTemplate
        fields = "__all__"


class ProjectStageElementTemplateSerializer(serializers.ModelSerializer):
    stage = ProjectStageTemplateSerializer(read_only=True)
    stage_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectStageTemplate.objects.all(),
        source="stage",
        write_only=True
    )

    class Meta:
        model = ProjectStageElementTemplate
        fields = "__all__"


class ProjectStageElementSerializer(serializers.ModelSerializer):
    template = ProjectStageElementTemplateSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectStageElementTemplate.objects.all(),
        source="template",
        write_only=True
    )

    class Meta:
        model = ProjectStageElement
        fields = "__all__"

    def validate_contribution_percentage(self, value):
        if value <= 0 or value > 100:
            raise serializers.ValidationError(
                "Contribution percentage must be between 1 and 100"
            )
        return value

class ProjectStageSerializer(serializers.ModelSerializer):
    template = ProjectStageTemplateSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectStageTemplate.objects.all(),
        source="template",
        write_only=True
    )

    # 🔥 ADD THIS
    elements = ProjectStageElementSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProjectStage
        fields = "__all__"






class ProjectTaskAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="user",
        write_only=True
    )

    class Meta:
        model = ProjectTaskAssignment
        fields = "__all__"


class StageElementVersionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = StageElementVersion
        fields = "__all__"
        read_only_fields = ["version_number", "created_at"]


class ProjectTimeLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectTimeLog
        fields = "__all__"


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAttachment
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Clients.objects.all(),
        source="client",
        write_only=True
    )

    created_by = UserSerializer(read_only=True)

    # 🔥 ADD THIS
    stages = ProjectStageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]