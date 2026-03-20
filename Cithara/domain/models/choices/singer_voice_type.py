"""Singer voice enumeration for songs."""

from django.db import models


class SingerVoiceType(models.TextChoices):
    """Singer voice preference for song generation."""
    MALE = "Male", "Male"
    FEMALE = "Female", "Female"
