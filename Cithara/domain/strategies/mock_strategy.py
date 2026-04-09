import uuid
from domain.models import Song
from domain.models.choices.generation_status import GenerationStatus
from .base import SongGeneratorStrategy

class MockSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Mock generator strategy that completes synchronously without 
    making any external API calls. Used for development and testing.
    """

    def generate(self, song: Song) -> dict:
        """
        Immediately process the song and generate a mock result.
        """
        # Assign a mock task ID
        # Update song object
        song.provider_task_id = f"mock-task-{uuid.uuid4()}"
        song.status = GenerationStatus.COMPLETED
        song.audio_file_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        song.save()
        
        return {
            "task_id": song.provider_task_id,
            "status": song.status,
            "audio_file_url": song.audio_file_url
        }

    def check_status(self, song: Song) -> dict:
        """
        For mock strategy, the generation finishes immediately in `generate`,
        so check_status just returns the current state.
        """
        return {
            "task_id": song.provider_task_id,
            "status": song.status,
            "audio_file_url": song.audio_file_url
        }
