"""Audio format enumeration for songs."""

from django.db import models


class AudioFormatType(models.TextChoices):
    """Supported audio output formats."""
    MP3 = "MP3", "MP3"
    M4A = "M4A", "M4A (AAC)"
    WAV = "WAV", "WAV"
