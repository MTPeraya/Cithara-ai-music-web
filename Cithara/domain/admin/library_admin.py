"""Django Admin configuration for Library model."""

from django.contrib import admin
from ..models import Library


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    """Admin interface for Library model."""
    
    list_display = ("user", "song_count", "created_at")
    list_filter = ("created_at", "user")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("id", "created_at", "song_count")
    
    fieldsets = (
        ("Library Information", {
            "fields": ("id", "user", "song_count")
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",)
        }),
    )
    
    ordering = ("-created_at",)

    def song_count(self, obj):
        """Display the count of songs in the library."""
        return obj.song_count()
    
    song_count.short_description = "Number of Songs"
