"""Occasion enumeration for songs."""

from django.db import models


class OccasionType(models.TextChoices):
    """Occasion or context for song generation."""
    BIRTHDAY = "Birthday"
    WEDDING = "Wedding", "Wedding"
    FUNERAL = "Funeral", "Funeral"
    PARTY = "Party", "Party"
    RELAXATION = "Relaxation", "Relaxation"
    STUDY = "Study", "Study"
    WORKOUT = "Workout", "Workout"
    OTHER = "Other", "Other"
