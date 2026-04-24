"""Django Admin configuration for Song model."""

from django.contrib import admin
from ..models import Song


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    """Admin interface for Song model."""
    
    list_display = ("title", "library", "genre", "mood", "status", "created_at")
    list_filter = ("status", "genre", "mood", "occasion", "created_at", "library")
    search_fields = ("title", "library__user__username", "prompt")
    readonly_fields = ("id", "created_at", "updated_at", "share_link_status")
    
    fieldsets = (
        ("Song Information", {
            "fields": ("id", "library", "title", "share_link_status")
        }),
        ("Generation Parameters", {
            "fields": ("genre", "mood", "occasion", "singer_voice", "prompt")
        }),
        ("Generation Output", {
            "fields": ("status", "duration", "audio_format", "audio_file_url")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    ordering = ("-created_at",)
    
    def share_link_status(self, obj):
        """Display whether a share link exists for this song."""
        try:
            return f"✓ Token: {obj.share_link.token[:8]}..." if obj.share_link else "✗ No share link"
        except:
            return "✗ No share link"
    
    share_link_status.short_description = "Share Link"

    def get_readonly_fields(self, request, obj=None):
        """Make library read-only for existing songs."""
        readonly_fields = list(self.readonly_fields)
        if obj:  # Editing an existing object
            readonly_fields.append("library")
        return readonly_fields
