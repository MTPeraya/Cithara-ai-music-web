"""
Abstract base class defining the interface for song generation strategies.

All concrete strategies (MockSongGeneratorStrategy, SunoSongGeneratorStrategy)
must implement the generate() and check_status() methods.
"""

from abc import ABC, abstractmethod
from domain.models import Song

class SongGeneratorStrategy(ABC):
    """
    Abstract base class defining the interface for song generation.
    """
    
    @abstractmethod
    def generate(self, song: Song) -> dict:
        """
        Trigger generation for a specific song.
        
        Args:
            song: The Song model instance containing the parameters.
            
        Returns:
            dict containing details about the generation request, such as a task_id.
        """
        pass

    @abstractmethod
    def check_status(self, song: Song) -> dict:
        """
        Check the updated generation status for a specific song.
        
        Args:
            song: The Song model instance.
            
        Returns:
            dict containing updated status, audio URL, etc.
        """
        pass
