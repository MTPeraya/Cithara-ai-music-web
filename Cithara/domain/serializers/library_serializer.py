"""Django REST Framework serializer for Library model."""

from rest_framework import serializers
from ..models import Library
from .user_serializer import UserSerializer


class LibrarySerializer(serializers.ModelSerializer):
    """Serializer for Library model."""
    user = UserSerializer(read_only=True)
    song_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Library
        fields = ['id', 'user', 'created_at', 'song_count']
        read_only_fields = ['id', 'created_at']
    
    def get_song_count(self, obj):
        """Return the number of songs in the library."""
        return obj.song_count()
