"""
Django REST Framework ViewSet for ShareLink model.

Provides CRUD operations:
- GET /api/share-links/ - List all share links
- POST /api/share-links/ - Create new share link
- GET /api/share-links/{id}/ - Retrieve specific share link
- PUT /api/share-links/{id}/ - Update share link
- DELETE /api/share-links/{id}/ - Delete share link

Also provides:
- GET /api/share-links/by-token/?token=<token> - Access shared song by token
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import ShareLink
from ..serializers import ShareLinkSerializer, SongSerializer


class ShareLinkViewSet(viewsets.ModelViewSet):
    """ViewSet for ShareLink model."""
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
