"""Django REST Framework serializer for User model."""

from rest_framework import serializers
from ..models import User, Library


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
