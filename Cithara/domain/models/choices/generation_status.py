"""Song generation status enumeration."""

from django.db import models


class GenerationStatus(models.TextChoices):
    """Song generation status enumeration."""
    QUEUED = "Queued", "Queued"
    GENERATING = "Generating", "Generating"
    COMPLETED = "Completed", "Completed"
    FAILED = "Failed", "Failed"
