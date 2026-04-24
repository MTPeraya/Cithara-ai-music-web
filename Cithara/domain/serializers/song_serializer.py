"""Django REST Framework serializer for Song model."""

from rest_framework import serializers
from ..models import Song
from .share_link_serializer import ShareLinkSerializer


class SongSerializer(serializers.ModelSerializer):
    """Serializer for Song model."""
    share_link = ShareLinkSerializer(read_only=True)
    
    class Meta:
        model = Song
        fields = [
            'id', 'library', 'title', 'genre', 'mood', 'occasion', 
            'singer_voice', 'prompt', 'status', 'duration', 'audio_format', 
            'audio_file_url', 'share_link', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
