import os
import django
import time
import uuid
import sys

# Load .env file manually if it exists
def load_env():
    env_path = os.path.join(os.getcwd(), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key.strip(), value.strip())

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'Cithara'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Cithara.settings')
load_env()
django.setup()

from domain.models import User, Library, Song
from domain.models.choices.genre_type import GenreType
from domain.models.choices.mood_type import MoodType
from domain.models.choices.occasion_type import OccasionType
from domain.models.choices.generation_status import GenerationStatus
from domain.strategies.factory import get_generator_strategy

def run_demo():
    print("=== Exercise 4 Strategy Pattern Demonstration ===")
    
    # Setup dummy data
    user_id = uuid.uuid4()
    user, created = User.objects.get_or_create(
        username=f"demo_user_{user_id.hex[:6]}",
        defaults={'email': f"demo_{user_id.hex[:6]}@example.com"}
    )
    
    library, created = Library.objects.get_or_create(user=user)
    
    song = Song.objects.create(
        library=library,
        title="Demo Strategy Song",
        genre=GenreType.ROCK,
        mood=MoodType.ENERGETIC,
        occasion=OccasionType.WORKOUT,
        status=GenerationStatus.QUEUED
    )

    print(f"Created Song record: {song.id}")
    
    # ---------------------------------------------------------
    # DEMO 1: MOCK STRATEGY
    # ---------------------------------------------------------
    print("\n" + "="*50)
    print("DEMO 1: Testing MOCK Strategy")
    print("="*50)
    
    # Store old values
    from django.conf import settings
    old_strategy = getattr(settings, 'GENERATOR_STRATEGY', None)
    
    # Force Mock strategy
    settings.GENERATOR_STRATEGY = 'mock'
    
    from domain.strategies.factory import get_generator_strategy
    mock_strategy = get_generator_strategy()
    print(f"Active Factory Strategy Instance: {mock_strategy.__class__.__name__}")
    
    song.status = GenerationStatus.QUEUED
    song.save()
    
    print("\n[Step 1] Triggering Mock generate()...")
    mock_result = mock_strategy.generate(song)
    print(f"Generate Response: {mock_result}")
    
    print("\n[Step 2] Simulated Polling for Mock Strategy...")
    # Check initial
    print(f"Check 1 (Immediate): {mock_strategy.check_status(song)}")
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Simulate 10 seconds later
    print("\nSetting song time back 10 seconds to simulate progress...")
    song.created_at = timezone.now() - timedelta(seconds=10)
    song.save()
    print(f"Check 2 (After 10s delay): {mock_strategy.check_status(song)}")
    
    # Simulate 20 seconds later
    print("\nSetting song time back 20 seconds to simulate completion...")
    song.created_at = timezone.now() - timedelta(seconds=20)
    song.save()
    print(f"Check 3 (After 20s delay): {mock_strategy.check_status(song)}")
    
    # ---------------------------------------------------------
    # DEMO 2: SUNO STRATEGY
    # ---------------------------------------------------------
    print("\n" + "="*50)
    print("DEMO 2: Testing SUNO Strategy")
    print("="*50)
    
    # Force Suno strategy
    settings.GENERATOR_STRATEGY = 'suno'
    
    # Ensure there's a dummy key if none exists so it attempts the call
    if not settings.SUNO_API_KEY:
        settings.SUNO_API_KEY = 'dummy_demo_key'
        
    suno_strategy = get_generator_strategy()
    print(f"Active Factory Strategy Instance: {suno_strategy.__class__.__name__}")
    
    # Reset song for Suno
    song.status = GenerationStatus.QUEUED
    song.audio_file_url = ""
    song.provider_task_id = ""
    song.save()
    
    print("\n[Step 1] Triggering Suno generate()...")
    print("Note: If the SUNO_API_KEY is invalid/dummy, this will gracefully fail.")
    suno_result = suno_strategy.generate(song)
    print(f"Generate Response: {suno_result}")

    print("\n[Step 2] Checking status for Suno API...")
    suno_status = suno_strategy.check_status(song)
    print(f"Check Status Response: {suno_status}")
    
    print("\n" + "-" * 50)
    print("Demo Completed.")

    # Restore old environment
    if old_strategy is not None:
        settings.GENERATOR_STRATEGY = old_strategy
    else:
        if hasattr(settings, 'GENERATOR_STRATEGY'):
            del settings.GENERATOR_STRATEGY

if __name__ == "__main__":
    run_demo()
