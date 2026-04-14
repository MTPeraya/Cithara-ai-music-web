"""
Django REST Framework views for Cithara domain models.

Provides API endpoints for creating, reading, updating, and deleting
User, Library, Song, and ShareLink entities.
"""

from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import User, Library, Song, ShareLink
from .serializers import UserSerializer, LibrarySerializer, SongSerializer, ShareLinkSerializer


def index(request):
    """
    Render the Cithara web interface.
    
    This is a simple frontend that demonstrates the REST API functionality.
    """
    return render(request, 'index.html')


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model.
    
    Provides CRUD operations:
    - GET /api/users/ - List all users
    - POST /api/users/ - Create new user
    - GET /api/users/{id}/ - Retrieve specific user
    - PUT /api/users/{id}/ - Update user
    - DELETE /api/users/{id}/ - Delete user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class LibraryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Library model.
    
    Provides CRUD operations:
    - GET /api/libraries/ - List all libraries
    - POST /api/libraries/ - Create new library
    - GET /api/libraries/{id}/ - Retrieve specific library
    - PUT /api/libraries/{id}/ - Update library
    - DELETE /api/libraries/{id}/ - Delete library
    """
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    
    @action(detail=True, methods=['get'])
    def songs(self, request, pk=None):
        """Get all songs in a library."""
        library = self.get_object()
        songs = library.songs.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)


class SongViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Song model.
    
    Provides CRUD operations:
    - GET /api/songs/ - List all songs
    - POST /api/songs/ - Create new song
    - GET /api/songs/{id}/ - Retrieve specific song
    - PUT /api/songs/{id}/ - Update song
    - DELETE /api/songs/{id}/ - Delete song (cascade deletes ShareLink)
    
    Also provides:
    - POST /api/songs/{id}/regenerate/ - Regenerate a song
    """
    serializer_class = SongSerializer

    def get_queryset(self):
        """
        Filter songs by library if library_id is provided in query parameters.
        Allow detail lookups (pk in kwargs).
        """
        queryset = Song.objects.all()
        
        # If accessing a specific song (detail view), allow it
        if self.detail or 'pk' in self.kwargs:
            return queryset

        library_id = self.request.query_params.get('library', None)
        if library_id:
            return queryset.filter(library_id=library_id)
        
        # Prevent accidental leakage of all songs on list view for non-staff
        if not self.request.user.is_staff:
            return Song.objects.none()
            
        return queryset
    
    def perform_create(self, serializer):
        """
        Create a song and automatically trigger generation using the active strategy.
        """
        song = serializer.save()
        from .strategies.factory import get_generator_strategy
        strategy = get_generator_strategy()
        strategy.generate(song)
    
    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """
        Regenerate a song by triggering the generation strategy again.
        
        This action is useful when a previous generation failed.
        """
        song = self.get_object()
        from .models.choices.generation_status import GenerationStatus
        from .strategies.factory import get_generator_strategy
        
        song.status = GenerationStatus.QUEUED
        song.audio_file_url = ""
        song.provider_task_id = ""
        song.save()
        
        strategy = get_generator_strategy()
        strategy.generate(song)
        
        serializer = self.get_serializer(song)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def check_status(self, request, pk=None):
        """
        Poll the generation provider for the latest status.
        """
        song = self.get_object()
        from .strategies.factory import get_generator_strategy
        
        strategy = get_generator_strategy()
        result = strategy.check_status(song)
        
        # Will return the latest state from the DB since check_status 
        # usually updates and saves the song.
        serializer = self.get_serializer(song)
        return Response({
            "song": serializer.data,
            "provider_result": result
        })


class ShareLinkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ShareLink model.
    
    Provides CRUD operations:
    - GET /api/share-links/ - List all share links
    - POST /api/share-links/ - Create new share link
    - GET /api/share-links/{id}/ - Retrieve specific share link
    - PUT /api/share-links/{id}/ - Update share link
    - DELETE /api/share-links/{id}/ - Delete share link
    
    Also provides:
    - GET /api/share-links/by-token/?token=<token> - Access shared song by token
    """
    queryset = ShareLink.objects.all()
    serializer_class = ShareLinkSerializer
    
    @action(detail=False, methods=['get'])
    def by_token(self, request):
        """
        Retrieve a song using its share token.
        
        Query parameter: token=<share_token>
        Returns the associated song data if token is valid.
        """
        token = request.query_params.get('token', None)
        if not token:
            return Response(
                {"error": "token parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            share_link = ShareLink.objects.get(token=token)
            song = share_link.song
            serializer = SongSerializer(song)
            return Response(serializer.data)
        except ShareLink.DoesNotExist:
            return Response(
                {"error": "Invalid share token"},
                status=status.HTTP_404_NOT_FOUND
            )
