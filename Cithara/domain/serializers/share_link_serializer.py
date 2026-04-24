"""Django REST Framework serializer for ShareLink model."""

from rest_framework import serializers
from ..models import ShareLink


class ShareLinkSerializer(serializers.ModelSerializer):
    """Serializer for ShareLink model."""
    
    class Meta:
        model = ShareLink
        fields = ['id', 'song', 'token', 'created_at']
        read_only_fields = ['id', 'token', 'created_at']
