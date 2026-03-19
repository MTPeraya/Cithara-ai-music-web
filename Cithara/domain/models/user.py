"""User domain model."""

import uuid
from django.db import models


class User(models.Model):
    """Represents an authenticated user of the system."""
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
