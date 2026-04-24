"""
Django REST Framework ViewSet for Library model.

Provides CRUD operations:
- GET /api/libraries/ - List all libraries
- POST /api/libraries/ - Create new library
- GET /api/libraries/{id}/ - Retrieve specific library
- PUT /api/libraries/{id}/ - Update library
- DELETE /api/libraries/{id}/ - Delete library

Also provides:
- GET /api/libraries/{id}/songs/ - Get all songs in a library
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Library
from ..serializers import LibrarySerializer, SongSerializer


class LibraryViewSet(viewsets.ModelViewSet):
    """ViewSet for Library model."""
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    
    @action(detail=True, methods=['get'])
    def songs(self, request, pk=None):
        """Get all songs in a library."""
        library = self.get_object()
        songs = library.songs.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)
