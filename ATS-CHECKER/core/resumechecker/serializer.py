from django.conf import settings
from rest_framework import serializers

from .models import JobDescription, Resume


class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = '__all__'


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'

    def validate_resume(self, value):
        if value.size > settings.MAX_RESUME_SIZE:
            raise serializers.ValidationError(
                f"File too large (max {settings.MAX_RESUME_SIZE // (1024 * 1024)} MB)."
            )
        return value
