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
    
    # 1. Strategy Selection
    strategy = get_generator_strategy()
    strategy_name = os.getenv('GENERATOR_STRATEGY', 'mock')
    print(f"Active Strategy: {strategy_name.upper()}")
    print("-" * 50)

    # 2. Setup dummy data
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
    
    # 3. Generate
    print("\n[Step 1] Triggering generate()...")
    result = strategy.generate(song)
    print(f"Generate Response: {result}")
    
    # 4. Polling (simulated for mock)
    if strategy_name == 'mock':
        print("\n[Step 2] Simulated Polling for Mock Strategy...")
        # Check initial
        print(f"Check 1 (Immediate): {strategy.check_status(song)}")
        
        # We manually update created_at for mock to simulate passage of time if needed
        # but mock strategy uses timedelta from created_at
        from django.utils import timezone
        from datetime import timedelta
        
        # Simulate 10 seconds later
        print("\nSetting song time back 10 seconds to simulate progress...")
        song.created_at = timezone.now() - timedelta(seconds=10)
        song.save()
        print(f"Check 2 (After 10s delay): {strategy.check_status(song)}")
        
        # Simulate 20 seconds later
        print("\nSetting song time back 20 seconds to simulate completion...")
        song.created_at = timezone.now() - timedelta(seconds=20)
        song.save()
        print(f"Check 3 (After 20s delay): {strategy.check_status(song)}")
    else:
        print("\n[Step 2] Checking status for Suno API (Polling record-info)...")
        print(f"Check Status Response: {strategy.check_status(song)}")
        
    print("-" * 50)
    print("Demo Completed.")

if __name__ == "__main__":
    run_demo()
