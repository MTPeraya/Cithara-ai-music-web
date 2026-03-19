"""Library domain model."""

import uuid
from django.db import models
from .user import User


class Library(models.Model):
    """Represents a user's personal song library."""
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
