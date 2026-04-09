"""Song domain model."""

import uuid
from django.db import models
from django.core.validators import MaxLengthValidator, MaxValueValidator
from .library import Library
from .choices.genre_type import GenreType
from .choices.mood_type import MoodType
from .choices.occasion_type import OccasionType
from .choices.singer_voice_type import SingerVoiceType
from .choices.audio_format_type import AudioFormatType
from .choices.generation_status import GenerationStatus


class Song(models.Model):
    """Represents a generated or to-be-generated song."""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the song"
    )
    library = models.ForeignKey(
        Library,
        on_delete=models.CASCADE,
        related_name="songs",
        help_text="Library that contains this song"
    )
    title = models.CharField(
        max_length=200,
        help_text="Song title"
    )
    genre = models.CharField(
        max_length=20,
        choices=GenreType.choices,
        default=GenreType.POP,
        help_text="Primary musical genre"
    )
    mood = models.CharField(
        max_length=20,
        choices=MoodType.choices,
        default=MoodType.HAPPY,
        help_text="Emotional mood/tone"
    )
    occasion = models.CharField(
        max_length=20,
        choices=OccasionType.choices,
        default=OccasionType.OTHER,
        help_text="Context or occasion for the song"
    )
    singer_voice = models.CharField(
        max_length=20,
        choices=SingerVoiceType.choices,
        default=SingerVoiceType.MALE,
        help_text="Preferred singer voice type"
    )
    prompt = models.TextField(
        max_length=1000,
        blank=True,
        default="",
        validators=[MaxLengthValidator(1000)],
        help_text="Optional extended prompt (max 1000 characters)"
    )
    provider_task_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Task ID from the generation provider (e.g., Suno)"
    )
    status = models.CharField(
        max_length=20,
        choices=GenerationStatus.choices,
        default=GenerationStatus.QUEUED,
        help_text="Current generation status"
    )
    duration = models.IntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(900)],
        help_text="Song duration in seconds (max 900/15 minutes)"
    )
    audio_format = models.CharField(
        max_length=10,
        choices=AudioFormatType.choices,
        default=AudioFormatType.MP3,
        help_text="Output audio format"
    )
    audio_file_url = models.URLField(
        blank=True,
        default="",
        help_text="URL to the generated audio file"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Song creation timestamp"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )

    class Meta:
        db_table = "songs"
        ordering = ["-created_at"]
        verbose_name = "Song"
        verbose_name_plural = "Songs"
        indexes = [
            models.Index(fields=["library", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.status})"

    def is_ready(self):
        """Check if song generation is complete."""
        return self.status == GenerationStatus.COMPLETED

    def is_failed(self):
        """Check if song generation failed."""
        return self.status == GenerationStatus.FAILED

    def is_generating(self):
        """Check if song is currently generating."""
        return self.status in [GenerationStatus.QUEUED, GenerationStatus.GENERATING]
