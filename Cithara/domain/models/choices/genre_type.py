"""Genre enumeration for songs."""

from django.db import models


class GenreType(models.TextChoices):
    """Musical genre enumeration."""
    ROCK = "Rock"
    POP = "Pop"
    JAZZ = "Jazz"
    HIPHOP = "HipHop", "Hip Hop"
    COUNTRY = "Country"
