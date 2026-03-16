"""
Django Admin configuration for Cithara domain models.

This module registers the domain models (User, Library, Song, ShareLink)
with Django Admin to provide CRUD functionality and demonstrate domain
persistence.
"""

from django.contrib import admin
from .models import User, Library, Song, ShareLink


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin interface for User model."""
    
    list_display = ("username", "email", "created_at")
    list_filter = ("created_at",)
    search_fields = ("username", "email")
    readonly_fields = ("id", "created_at")
    
    fieldsets = (
        ("User Information", {
            "fields": ("id", "username", "email")
        }),
        ("Timestamps", {
            "fields": ("created_at",),
            "classes": ("collapse",)
        }),
    )
    
    ordering = ("-created_at",)


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
