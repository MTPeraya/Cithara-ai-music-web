"""Mood enumeration for songs."""

from django.db import models


class MoodType(models.TextChoices):
    """Emotional mood enumeration for songs."""
    HAPPY = "Happy"
    SAD = "Sad"
    ENERGETIC = "Energetic"
    CALM = "Calm"
