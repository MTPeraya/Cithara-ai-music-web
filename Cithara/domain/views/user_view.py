"""
Django REST Framework ViewSet for User model.

Provides CRUD operations:
- GET /api/users/ - List all users
- POST /api/users/ - Create new user
- GET /api/users/{id}/ - Retrieve specific user
- PUT /api/users/{id}/ - Update user
- DELETE /api/users/{id}/ - Delete user
"""

from rest_framework import viewsets
from ..models import User
from ..serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
