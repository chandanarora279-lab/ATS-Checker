from django.core.validators import FileExtensionValidator
from django.db import models


class Resume(models.Model):
    resume = models.FileField(
        upload_to="resume",
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    def __str__(self):
        return self.resume.name


class JobDescription(models.Model):
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()

    def __str__(self):
        return self.job_title
