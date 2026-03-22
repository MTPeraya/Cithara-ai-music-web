"""
Django REST Framework serializers for Cithara domain models.

Provides serialization for User, Library, Song, and ShareLink models
to enable REST API endpoints for CRUD operations.
"""

from rest_framework import serializers
from .models import User, Library, Song, ShareLink


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        """Create a user and automatically create their library."""
        user = User.objects.create(**validated_data)
        # Automatically create a library for the user
        Library.objects.create(user=user)
        return user


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


class ShareLinkSerializer(serializers.ModelSerializer):
    """Serializer for ShareLink model."""
    
    class Meta:
        model = ShareLink
        fields = ['id', 'song', 'token', 'created_at']
        read_only_fields = ['id', 'token', 'created_at']


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
