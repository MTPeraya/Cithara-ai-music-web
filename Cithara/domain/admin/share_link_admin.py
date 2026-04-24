"""Django Admin configuration for ShareLink model."""

from django.contrib import admin
from ..models import ShareLink


@admin.register(ShareLink)
class ShareLinkAdmin(admin.ModelAdmin):
    """Admin interface for ShareLink model."""
    
    list_display = ("song", "token_display", "created_at")
    list_filter = ("created_at", "song__library__user")
    search_fields = ("song__title", "token", "song__library__user__username")
    readonly_fields = ("id", "token", "created_at")
    
    fieldsets = (
        ("Share Link Information", {
            "fields": ("id", "song", "token")
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",)
        }),
    )
    
    ordering = ("-created_at",)

    def token_display(self, obj):
        """Display truncated token for readability."""
        return f"{obj.token[:8]}..." if obj.token else "N/A"
    
    token_display.short_description = "Token"

    def get_readonly_fields(self, request, obj=None):
        """Make song read-only for existing share links."""
        readonly_fields = list(self.readonly_fields)
        if obj:  # Editing an existing object
            readonly_fields.append("song")
        return readonly_fields
