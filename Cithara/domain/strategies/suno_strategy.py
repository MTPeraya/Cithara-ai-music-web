import json
import logging
import requests
from django.conf import settings
from domain.models import Song
from domain.models.choices.generation_status import GenerationStatus
from .base import SongGeneratorStrategy

logger = logging.getLogger(__name__)

class SunoSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Generator strategy that integrates with the Suno API (api.sunoapi.org).
    """

    GENERATE_URL = "https://api.sunoapi.org/api/v1/generate"
    RECORD_INFO_URL = "https://api.sunoapi.org/api/v1/generate/record-info"

    def _get_headers(self) -> dict:
        token = getattr(settings, "SUNO_API_KEY", "")
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def generate(self, song: Song) -> dict:
        """
        Calls Suno 'Generate Music' endpoint.
        """
        payload = {
            "prompt": song.prompt or f"A {song.get_genre_display()} song for {song.get_occasion_display()} with a {song.get_mood_display()} mood",
            "title": song.title,
            "make_instrumental": False
        }
        
        # Mark as generating
        song.status = GenerationStatus.GENERATING
        song.save()

        try:
            response = requests.post(
                self.GENERATE_URL,
                headers=self._get_headers(),
                json=payload,
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract taskId (SunoAPI usually returns taskId or similar in response)
            # Assuming {'taskId': '...'} or {'data': {'taskId': '...'}}
            
            # The API might directly return taskId or a list of tasks. 
            # We'll safely check standard places.
            task_id = data.get("taskId")
            if not task_id and "data" in data and isinstance(data["data"], dict):
                task_id = data["data"].get("taskId")
            
            if not task_id:
                # Fallback maybe?
                task_id = data.get("id")

            if task_id:
                song.provider_task_id = task_id
                song.save()
                return {"task_id": task_id, "status": song.status}
            else:
                logger.error(f"Suno API returned no task_id in response: {data}")
                song.status = GenerationStatus.FAILED
                song.save()
                return {"error": "No task_id returned from Suno API"}

        except Exception as e:
            logger.error(f"Error during Suno API generation: {str(e)}")
            song.status = GenerationStatus.FAILED
            song.save()
            return {"error": str(e), "status": song.status}

    def check_status(self, song: Song) -> dict:
        """
        Polls the Suno API for status using record-info.
        """
        if not song.provider_task_id:
            return {"error": "No task_id associated with this song"}

        try:
            # Note: We assume taskId is passed as a query param. 
            response = requests.get(
                self.RECORD_INFO_URL,
                headers=self._get_headers(),
                params={"taskId": song.provider_task_id},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            
            # data might be the task info itself or a list. Let's find status.
            task_info = data.get("data", data)
            
            # Sometimes record-info returns a list
            if isinstance(task_info, list) and len(task_info) > 0:
                task_info = task_info[0]

            suno_status = task_info.get("status", "").upper()
            
            # Map Suno statuses to our GenerationStatus
            if suno_status in ["PENDING", "TEXT_SUCCESS", "FIRST_SUCCESS", "SUBMITTED"]:
                song.status = GenerationStatus.GENERATING
            elif suno_status == "SUCCESS":
                song.status = GenerationStatus.COMPLETED
                song.audio_file_url = task_info.get("audioUrl", "") or task_info.get("audio_url", "")
            elif suno_status in ["FAILED", "ERROR"]:
                song.status = GenerationStatus.FAILED
                
            song.save()
            return {
                "task_id": song.provider_task_id,
                "status": song.status,
                "audio_file_url": song.audio_file_url,
                "suno_status": suno_status
            }
            
        except Exception as e:
            logger.error(f"Error checking Suno API status: {str(e)}")
            return {"error": str(e)}
