"""
Domain models for Cithara AI Music Web application.

This module implements the domain layer following the approved domain model 
from Exercise 2 (Model&Supporting_notes.pdf). It defines the core entities:
User, Library, Song, and ShareLink, with their relationships and constraints.
"""

import uuid
from django.db import models
from django.core.validators import MaxLengthValidator, MaxValueValidator


# Enumerations (Django Choices)

class GenreType(models.TextChoices):
    """Musical genre enumeration."""
    ROCK = "Rock", "Rock"
    POP = "Pop", "Pop"
    JAZZ = "Jazz", "Jazz"
    HIPHOP = "HipHop", "Hip Hop"
    COUNTRY = "Country", "Country"


class MoodType(models.TextChoices):
    """Emotional mood enumeration for songs."""
    HAPPY = "Happy", "Happy"
    SAD = "Sad", "Sad"
    ENERGETIC = "Energetic", "Energetic"
    CALM = "Calm", "Calm"


class OccasionType(models.TextChoices):
    """Occasion or context for song generation."""
    BIRTHDAY = "Birthday", "Birthday"
    WEDDING = "Wedding", "Wedding"
    FUNERAL = "Funeral", "Funeral"
    PARTY = "Party", "Party"
    RELAXATION = "Relaxation", "Relaxation"
    WORKOUT = "Workout", "Workout"
    STUDY = "Study", "Study"
    OTHER = "Other", "Other"


class SingerVoiceType(models.TextChoices):
    """Singer voice preference for song generation."""
    MALE = "Male", "Male"
    FEMALE = "Female", "Female"
    NEUTRAL = "Neutral", "Neutral"
    DUET = "Duet", "Duet"


class AudioFormatType(models.TextChoices):
    """Supported audio output formats."""
    MP3 = "MP3", "MP3"
    M4A = "M4A", "M4A (AAC)"
    WAV = "WAV", "WAV"


class GenerationStatus(models.TextChoices):
    """Song generation status enumeration."""
    QUEUED = "Queued", "Queued"
    GENERATING = "Generating", "Generating"
    COMPLETED = "Completed", "Completed"
    FAILED = "Failed", "Failed"



# Domain Models

class User(models.Model):
    """
    Represents an authenticated user of the system.
    
    Constraints:
    - Each user owns exactly one private library
    - Each user must authenticate before accessing any system feature
    - Authentication is handled externally (Google OAuth)
    
    Note: Authentication implementation is deferred to later phases
    as per assignment scope (no authentication required).
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the user"
    )
    email = models.EmailField(
        unique=True,
        help_text="User email address (from Google OAuth)"
    )
    username = models.CharField(
        max_length=150,
        unique=True,
        help_text="Username for display purposes"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Account creation timestamp"
    )

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.username} ({self.email})"


class Library(models.Model):
    """
    Represents a user's personal song library.
    
    Constraints:
    - Each user owns exactly one private library (1:1 relationship)
    - A library can contain 0 to 1,000,000 songs
    - Libraries cannot be shared between users
    - Users may delete songs from their own library
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the library"
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="library",
        help_text="Owner of this library"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Library creation timestamp"
    )
    
    class Meta:
        db_table = "libraries"
        verbose_name = "Library"
        verbose_name_plural = "Libraries"

    def __str__(self):
        return f"Library of {self.user.username}"

    def song_count(self):
        """Return the number of songs in this library."""
        return self.songs.count()


class Song(models.Model):
    """
    Represents a generated or to-be-generated song.
    
    Constraints:
    - Each song belongs to exactly one library (many-to-one)
    - Song duration must not exceed 15 minutes (900 seconds)
    - Prompt text must not exceed 1,000 characters
    - Exactly one genre, mood, occasion, and singer voice must be selected
    - Supported audio formats: MP3, M4A, WAV
    - Song generation status must be tracked
    
    Relationships:
    - Many-to-One: Library (composition)
    - One-to-One: ShareLink (composition with lifecycle dependency)
    """
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


class ShareLink(models.Model):
    """
    Represents a shareable link for a song.
    
    Constraints:
    - Each song has exactly one shareable link (1:1 composition)
    - A share link cannot exist without its associated song
    - When a song is deleted, its share link is automatically deleted
    - Only authenticated users with a valid link can access a shared song
    - Entire libraries cannot be shared (only individual songs)
    
    Design Note:
    This uses composition (on_delete=CASCADE) to enforce lifecycle dependency
    as specified in the domain model. The token acts as a unique access key
    for sharing.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the share link"
    )
    song = models.OneToOneField(
        Song,
        on_delete=models.CASCADE,
        related_name="share_link",
        help_text="Song associated with this share link"
    )
    token = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        help_text="Unique access token for sharing"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Share link creation timestamp"
    )
    
    class Meta:
        db_table = "share_links"
        verbose_name = "Share Link"
        verbose_name_plural = "Share Links"

    def __str__(self):
        return f"Share link for {self.song.title}"

    def save(self, *args, **kwargs):
        """Generate token if creating a new share link."""
        if not self.token:
            import secrets
            self.token = secrets.token_urlsafe(24)[:32]
        super().save(*args, **kwargs)
