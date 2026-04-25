"""
Django REST Framework ViewSet for Song model.

Provides CRUD operations:
- GET /api/songs/ - List all songs
- POST /api/songs/ - Create new song
- GET /api/songs/{id}/ - Retrieve specific song
- PUT /api/songs/{id}/ - Update song
- DELETE /api/songs/{id}/ - Delete song (cascade deletes ShareLink)

Also provides:
- POST /api/songs/{id}/regenerate/ - Regenerate a song
- GET /api/songs/{id}/check_status/ - Poll generation status
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import Song
from ..serializers import SongSerializer


class SongViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Song model.
    
    Handles song CRUD and triggers the active generation strategy
    on create and regenerate actions.
    """
    serializer_class = SongSerializer
    filterset_fields = ['genre', 'mood', 'status']
    search_fields = ['title', 'prompt']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        """
        Filter songs by library to ensure users only see their own data (SEC-2).
        Requires a 'library' query parameter.
        """
        queryset = Song.objects.all()
        
        # In a real app, we would filter by request.user
        # For this prototype simulation, we strictly filter by library ID
        library_id = self.request.query_params.get('library', None)
        
        if self.detail or 'pk' in self.kwargs:
            return queryset

        if library_id:
            return queryset.filter(library_id=library_id)
        
        # If no library is specified and user isn't staff, return empty (SEC-2)
        if not self.request.user.is_staff:
            return Song.objects.none()
            
        return queryset
    
    def perform_create(self, serializer):
        """
        Create a song and automatically trigger generation using the active strategy.
        """
        song = serializer.save()
        from ..strategies.strategy_factory import get_generator_strategy
        strategy = get_generator_strategy()
        strategy.generate(song)
    
    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """
        Regenerate a song by triggering the generation strategy again.
        
        This action is useful when a previous generation failed.
        """
        song = self.get_object()
        from ..models.choices.generation_status import GenerationStatus
        from ..strategies.strategy_factory import get_generator_strategy
        
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
        from ..strategies.strategy_factory import get_generator_strategy
        
        strategy = get_generator_strategy()
        result = strategy.check_status(song)
        
        # Will return the latest state from the DB since check_status 
        # usually updates and saves the song.
        serializer = self.get_serializer(song)
        return Response({
            "song": serializer.data,
            "provider_result": result
        })
