from rest_framework import serializers
from .models import (
    Project, ProjectStage, ProjectStageElement,
    StageElementVersion, StageElementInputOutput,
    ArtistContribution, ProjectTimeLog
)





# ---------------------------
# Stage Element / Task
# ---------------------------
class ProjectStageElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStageElement
        fields = "__all__"

# ---------------------------
# Project Stage
# ---------------------------
class ProjectStageSerializer(serializers.ModelSerializer):
    elements = ProjectStageElementSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectStage
        fields = ["id", "name", "order", "status", "elements"]

# ---------------------------
# Versioning
# ---------------------------
class StageElementVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageElementVersion
        fields = "__all__"


# ---------------------------
# Inputs / Outputs
# ---------------------------
class StageElementInputOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageElementInputOutput
        fields = "__all__"


# ---------------------------
# Artist Contribution
# ---------------------------
class ArtistContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistContribution
        fields = "__all__"


# ---------------------------
# Time Logs
# ---------------------------
class ProjectTimeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTimeLog
        fields = "__all__"




# ---------------------------
# Project
# ---------------------------

class ProjectSerializer(serializers.ModelSerializer):
    # 1. Nest the Stages (which will eventually contain tasks)
    stages = ProjectStageSerializer(many=True, read_only=True)
    
    # 2. Nest the Artist Contributions
    # contributions = ArtistContributionSerializer(many=True, read_only=True, source="artistcontribution_set")
    
    # 3. Nest the Attachments (if needed)
    # attachments = ProjectAttachmentSerializer(many=True, read_only=True, source="projectattachment_set")

    class Meta:
        model = Project
        # List the fields explicitly to include the new nested fields
        fields = [
            "id", "name", "project_type", "service_type", "priority", 
            "status", "start_date", "due_date", "budget", 
            "stages",
            "client", "created_by"
        ]

        