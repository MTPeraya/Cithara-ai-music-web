"""Share link domain model."""

import uuid
from django.db import models


class ShareLink(models.Model):
    """Represents a shareable link for a song."""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the share link"
    )
    song = models.OneToOneField(
        "Song",
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
