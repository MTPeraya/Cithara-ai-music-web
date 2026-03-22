"""
URL routing for Cithara domain API endpoints and frontend.

Registers ViewSets with DRF's DefaultRouter to automatically generate
CRUD endpoints for User, Library, Song, and ShareLink models.

API Base Path: /api/
Frontend: /
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, LibraryViewSet, SongViewSet, ShareLinkViewSet, index

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'libraries', LibraryViewSet, basename='library')
router.register(r'songs', SongViewSet, basename='song')
router.register(r'share-links', ShareLinkViewSet, basename='share-link')

# API endpoints
urlpatterns = [
    path('', include(router.urls)),
    
]
