import uuid
from django.utils import timezone
from domain.models import Song
from domain.models.choices.generation_status import GenerationStatus
from .base import SongGeneratorStrategy

class MockSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Mock generator strategy that simulates a timed generation process
    to allow testing of the frontend loading states.
    """

    def generate(self, song: Song) -> dict:
        """
        Seed the song logic and set initial status.
        """
        song.provider_task_id = f"mock-task-{uuid.uuid4()}"
        song.status = GenerationStatus.QUEUED
        song.save()
        
        return {
            "task_id": song.provider_task_id,
            "status": song.status,
            "audio_file_url": ""
        }

    def check_status(self, song: Song) -> dict:
        """
        Simulate a transition from QUEUED -> GENERATING -> COMPLETED
        based on how long ago the song was created.
        """
        now = timezone.now()
        elapsed = (now - song.created_at).total_seconds()

        # 0-5 seconds: Stay in Queued
        if elapsed < 5:
            new_status = GenerationStatus.QUEUED
        # 5-15 seconds: Move to Generating
        elif elapsed < 15:
            new_status = GenerationStatus.GENERATING
        # 15+ seconds: Complete
        else:
            new_status = GenerationStatus.COMPLETED
            if not song.audio_file_url:
                song.audio_file_url = "http://localhost:8000/static/audio/mock_song.mp3"

        # Update DB if status changed
        if song.status != new_status:
            song.status = new_status
            song.save()

        return {
            "task_id": song.provider_task_id,
            "status": song.status,
            "audio_file_url": song.audio_file_url
        }
