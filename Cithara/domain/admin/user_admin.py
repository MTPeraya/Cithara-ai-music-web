"""Django Admin configuration for User model."""

from django.contrib import admin
from ..models import User


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
