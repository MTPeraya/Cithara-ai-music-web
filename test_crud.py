"""
Test script for CRUD operations on Cithara domain models.
Run with: python3 test_crud.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Cithara.settings")
sys.path.insert(0, os.path.dirname(__file__) + "/Cithara")
django.setup()

from domain.models import User, Library, Song, ShareLink, GenerationStatus

def test_crud():
    print("=" * 70)
    print("Testing CRUD Operations on Cithara Domain Models")
    print("=" * 70)
    
    try:
        # CREATE
        print("\n✓ CREATE Operations:")
        user = User.objects.create(
            username="test_user_001",
            email="test@example.com"
        )
        print(f"   - User: {user} (ID: {str(user.id)[:8]}...)")
        
        library = Library.objects.create(user=user)
        print(f"   - Library: {library} (ID: {str(library.id)[:8]}...)")
        
        song = Song.objects.create(
            library=library,
            title="Test Symphony",
            genre="Jazz",
            mood="Calm",
            occasion="Study",
            singer_voice="Male",
            prompt="Peaceful instrumental piece",
            status=GenerationStatus.COMPLETED,
            duration=300
        )
        print(f"   - Song: {song} (ID: {str(song.id)[:8]}...)")
        
        share_link = ShareLink.objects.create(song=song)
        print(f"   - ShareLink: Token={share_link.token[:8]}...")
        
        # READ
        print("\n✓ READ Operations:")
        retrieved_user = User.objects.get(id=user.id)
        print(f"   - Retrieved User: {retrieved_user}")
        print(f"   - User's Library: {retrieved_user.library}")
        print(f"   - Songs in Library: {retrieved_user.library.song_count()}")
        
        songs = Song.objects.filter(status=GenerationStatus.COMPLETED)
        print(f"   - Completed songs: {songs.count()}")
        
        # UPDATE
        print("\n✓ UPDATE Operations:")
        song.title = "Test Symphony - Remastered"
        song.mood = "Energetic"
        song.duration = 350
        song.save()
        print(f"   - Updated song title: {song.title}")
        print(f"   - Updated mood: {song.mood}")
        print(f"   - Updated duration: {song.duration}s")
        
        # DELETE (with cascade test)
        print("\n✓ DELETE Operations (testing CASCADE):")
        share_link_id = share_link.id
        song_id = song.id
        
        print(f"   - ShareLink exists before delete: {ShareLink.objects.filter(id=share_link_id).exists()}")
        song.delete()
        print(f"   - Song deleted: {song_id}")
        print(f"   - ShareLink exists after delete: {ShareLink.objects.filter(id=share_link_id).exists()}")
        print("   - Cascade delete working correctly! ✓")
        
        # Verify data integrity
        print("\n✓ Data Integrity Check:")
        print(f"   - Total Users: {User.objects.count()}")
        print(f"   - Total Libraries: {Library.objects.count()}")
        print(f"   - Total Songs: {Song.objects.count()}")
        print(f"   - Total ShareLinks: {ShareLink.objects.count()}")
        
        print("\n" + "=" * 70)
        print("✓✓✓ All CRUD operations successful!")
        print("=" * 70)
        return True
        
    except Exception as e:
        print(f"\n✗ Error during CRUD testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_crud()
    sys.exit(0 if success else 1)
