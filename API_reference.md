# Cithara - Python API reference for developers

This document provides detailed Python API reference for programmatically 
accessing the Cithara domain models.


## 1. IMPORTS

```python
# Core models
from domain.models import User, Library, Song, ShareLink

# Enumeration types
from domain.models import (
    GenreType,
    MoodType, 
    OccasionType,
    SingerVoiceType,
    AudioFormatType,
    GenerationStatus
)

# Django ORM
from django.db.models import Q, Count, Avg

# UUID for primary keys
from uuid import UUID
```


## 2. USER API

### Create User
```python
user = User.objects.create(
    username="john_doe",           # (required) unique, max 150 chars
    email="john@example.com"       # (required) unique
)

# Access auto-generated fields
print(f"User ID: {user.id}")              # UUID
print(f"Created at: {user.created_at}")   # datetime (auto)

# Access foreign key
library = user.library                    # OneToOne relationship
```

### Query Users
```python
# Get by primary key
user = User.objects.get(id=UUID("12345678-1234-5678-1234-567812345678"))

# Get by username
user = User.objects.get(username="john_doe")

# Get by email
user = User.objects.get(email="john@example.com")

# Get all users
all_users = User.objects.all()

# Filter users
recent_users = User.objects.filter(created_at__gte="2024-01-01")

# Check if exists
exists = User.objects.filter(username="john_doe").exists()

# Count
user_count = User.objects.count()

# Get with related data
user = User.objects.select_related('library').get(username="john_doe")
```

### Update User
```python
user = User.objects.get(username="john_doe")
user.email = "john.new@example.com"
user.save()

# Bulk update
User.objects.filter(created_at__lt="2024-01-01").update(email="old@example.com")
```

### Delete User
```python
user = User.objects.get(username="john_doe")
user.delete()
# CASCADE: Library → Songs → ShareLinks all deleted

# Bulk delete
User.objects.filter(username__startswith="test_").delete()
```

### User Properties
```python
print(user.id)           # UUID
print(user.username)     # str (unique)
print(user.email)        # str (unique)
print(user.created_at)   # datetime (auto)
```


## 3. LIBRARY API

### Create Library
```python
user = User.objects.get(username="john_doe")
library = Library.objects.create(user=user)

# Access auto-generated fields
print(f"Library ID: {library.id}")        # UUID
```

### Query Libraries
```python
# Get user's library (OneToOne relationship)
user = User.objects.get(username="john_doe")
library = user.library

# Get library by ID
library = Library.objects.get(id=UUID("..."))

# Get library by user
library = Library.objects.get(user__username="john_doe")

# Get libraries created after date
recent_libs = Library.objects.filter(user__created_at__gte="2024-01-01")

# Get with related songs
library = Library.objects.prefetch_related('songs').get(id=...)
```

### Access Library Contents
```python
library = user.library

# Get all songs
all_songs = library.songs.all()

# Count songs
num_songs = library.song_count()

# Filter library songs
completed = library.songs.filter(status=GenerationStatus.COMPLETED)
jazz_songs = library.songs.filter(genre=GenreType.JAZZ)

# Get song count by status
generating = library.songs.filter(status=GenerationStatus.GENERATING).count()
failed = library.songs.filter(status=GenerationStatus.FAILED).count()

# Get average song duration
avg_duration = library.songs.aggregate(Avg('duration'))['duration__avg']

# Get most recent song
latest = library.songs.latest('created_at')

# Get oldest song
oldest = library.songs.earliest('created_at')
```

### Update Library
```python
library = user.library
library.save()  # Update timestamp

# Note: Library has minimal fields - mainly a container for songs
```

### Delete Library
```python
library = user.library
library.delete()
# CASCADE: All Songs → All ShareLinks deleted

# Note: Normally delete via user.delete() instead
```

### Library Properties
```python
library = user.library
print(library.id)           # UUID
print(library.user_id)      # UUID (ForeignKey)
print(library.user)         # User object
print(library.songs)        # QuerySet of Song objects
print(library.song_count()) # int (0 to 1,000,000)
```

## 4. SONG API

### Create Song
```python
user = User.objects.get(username="john_doe")
song = Song.objects.create(
    # Required fields
    library=user.library,
    title="My Beautiful Song",           # max 255 chars
    genre=GenreType.JAZZ,                # choice field
    mood=MoodType.CALM,                  # choice field
    occasion=OccasionType.STUDY,         # choice field
    singer_voice=SingerVoiceType.FEMALE, # choice field
    status=GenerationStatus.QUEUED,      # choice field
    
    # Optional fields
    prompt="Beautiful jazz melody",      # max 1000 chars, optional
    duration=240,                        # max 900 seconds, optional
    audio_format=AudioFormatType.MP3,    # choice field, default="MP3"
    audio_file_url="https://example.com/song.mp3"  # optional
)

# Access auto-generated fields
print(f"Song ID: {song.id}")              # UUID
print(f"Created: {song.created_at}")      # datetime
print(f"Updated: {song.updated_at}")      # datetime
```

### Query Songs
```python
# Get by ID
song = Song.objects.get(id=UUID("..."))

# Get by title
song = Song.objects.get(title="My Beautiful Song")

# Get by library
user = User.objects.get(username="john_doe")
songs = Song.objects.filter(library=user.library)

# Filter by status
completed = Song.objects.filter(status=GenerationStatus.COMPLETED)
generating = Song.objects.filter(status=GenerationStatus.GENERATING)
failed = Song.objects.filter(status=GenerationStatus.FAILED)

# Filter by genre
jazz = Song.objects.filter(genre=GenreType.JAZZ)
rock = Song.objects.filter(genre=GenreType.ROCK)

# Filter by mood
happy = Song.objects.filter(mood=MoodType.HAPPY)

# Filter by occasion
party = Song.objects.filter(occasion=OccasionType.PARTY)

# Filter by voice
female_songs = Song.objects.filter(singer_voice=SingerVoiceType.FEMALE)

# Filter by audio format
mp3s = Song.objects.filter(audio_format=AudioFormatType.MP3)

# Complex queries
jazz_party = Song.objects.filter(
    genre=GenreType.JAZZ,
    occasion=OccasionType.PARTY
)

completed_jazz = Song.objects.filter(
    status=GenerationStatus.COMPLETED,
    genre=GenreType.JAZZ
)

# Filter by creation date
today = Song.objects.filter(created_at__date="2024-01-15")
this_month = Song.objects.filter(created_at__month=1, created_at__year=2024)

# Filter by duration
short_songs = Song.objects.filter(duration__lte=180)  # <= 3 minutes
long_songs = Song.objects.filter(duration__gt=300)    # > 5 minutes

# Filter by prompt length
with_prompt = Song.objects.exclude(prompt="")
without_prompt = Song.objects.filter(prompt="")

# Sort
by_date_asc = Song.objects.order_by('created_at')
by_date_desc = Song.objects.order_by('-created_at')
by_duration = Song.objects.order_by('duration')
by_title = Song.objects.order_by('title')

# Limit
latest_10 = Song.objects.all().order_by('-created_at')[:10]
first_5 = Song.objects.all()[:5]

# Count
total = Song.objects.count()
by_genre = Song.objects.values('genre').annotate(count=Count('id'))
by_status = Song.objects.values('status').annotate(count=Count('id'))

# Aggregation
stats = Song.objects.aggregate(
    total=Count('id'),
    avg_duration=Avg('duration'),
    max_duration=Max('duration'),
    min_duration=Min('duration')
)

# Using Q for complex queries (OR conditions)
from django.db.models import Q
upbeat = Song.objects.filter(
    Q(genre=GenreType.ROCK) | Q(genre=GenreType.HIPHOP)
)

# Get with related data
song = Song.objects.select_related('library', 'library__user').get(id=...)
```

### Update Song
```python
song = Song.objects.get(title="My Beautiful Song")

# Update single field
song.status = GenerationStatus.COMPLETED
song.save()

# Update multiple fields
song.duration = 300
song.audio_file_url = "https://example.com/song.mp3"
song.status = GenerationStatus.COMPLETED
song.save()

# Bulk update
Song.objects.filter(status=GenerationStatus.QUEUED).update(
    status=GenerationStatus.GENERATING
)

# Conditional update
import datetime
old_generating = Song.objects.filter(
    status=GenerationStatus.GENERATING,
    created_at__lt=datetime.datetime.now() - datetime.timedelta(hours=1)
).update(status=GenerationStatus.FAILED)
```

### Delete Song
```python
song = Song.objects.get(title="My Beautiful Song")
song.delete()
# CASCADE: Associated ShareLink automatically deleted

# Bulk delete
Song.objects.filter(status=GenerationStatus.FAILED).delete()

# Delete all songs for a user
user = User.objects.get(username="john_doe")
user.library.songs.all().delete()
```

### Song Status Helper Methods
```python
song = Song.objects.get(title="My Song")

# Check status using helper methods
if song.is_ready():
    print("Song is ready to play")
    play_song(song.audio_file_url)

if song.is_generating():
    print("Song is still being generated, please wait...")
    
if song.is_failed():
    print("Song generation failed, please regenerate")
    song.status = GenerationStatus.QUEUED
    song.save()
```

### Song Properties
```python
song = Song.objects.get(title="My Song")

print(song.id)                  # UUID
print(song.library_id)          # UUID (ForeignKey)
print(song.library)             # Library object
print(song.title)               # str
print(song.genre)               # str (GenreType choice)
print(song.mood)                # str (MoodType choice)
print(song.occasion)            # str (OccasionType choice)
print(song.singer_voice)        # str (SingerVoiceType choice)
print(song.prompt)              # str or empty
print(song.status)              # str (GenerationStatus choice)
print(song.duration)            # int or None (seconds)
print(song.audio_format)        # str (AudioFormatType choice)
print(song.audio_file_url)      # str or None
print(song.created_at)          # datetime
print(song.updated_at)          # datetime
```

## 5. SHARELINK API


### Create ShareLink
```python
song = Song.objects.get(title="My Beautiful Song")
share_link = ShareLink.objects.create(song=song)

# Token auto-generated
print(f"Share Token: {share_link.token}")  # 32-character string
```

### Query ShareLink
```python
# Get by song
song = Song.objects.get(title="My Beautiful Song")
share_link = song.share_link

# Get by ID
share_link = ShareLink.objects.get(id=UUID("..."))

# Get by token
share_link = ShareLink.objects.get(token="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6")

# Get all share links
all_links = ShareLink.objects.all()

# Get share links created in date range
from datetime import datetime, timedelta
week_ago = datetime.now() - timedelta(days=7)
recent = ShareLink.objects.filter(created_at__gte=week_ago)

# Get with related song data
share_link = ShareLink.objects.select_related('song', 'song__library').get(id=...)

# Count
total_links = ShareLink.objects.count()

# Get share link for user's songs
user = User.objects.get(username="john_doe")
user_share_links = ShareLink.objects.filter(song__library=user.library)
```

### Update ShareLink
```python
share_link = song.share_link
share_link.save()  # Update timestamp

# Note: ShareLink has minimal fields - token and song reference
```

### Delete ShareLink
```python
share_link = song.share_link
share_link.delete()

# Bulk delete (careful!)
ShareLink.objects.filter(created_at__lt="2023-01-01").delete()

# Delete automatically via song deletion (CASCADE)
song.delete()  # ShareLink auto-deleted
```

### ShareLink Properties
```python
share_link = song.share_link

print(share_link.id)          # UUID
print(share_link.song_id)     # UUID (OneToOne ForeignKey)
print(share_link.song)        # Song object
print(share_link.token)       # str (32 chars, unique)
print(share_link.created_at)  # datetime
```

## 6. ENUMERATION TYPES - DETAILED REFERENCE


### GenreType
```python
from domain.models import GenreType

# Available values
GenreType.ROCK          # "Rock"
GenreType.POP           # "Pop"
GenreType.JAZZ          # "Jazz"
GenreType.HIPHOP        # "HipHop"
GenreType.COUNTRY       # "Country"

# Get all choices
all_genres = GenreType.choices
# Output: [('Rock', 'Rock'), ('Pop', 'Pop'), ('Jazz', 'Jazz'), ('HipHop', 'HipHop'), ('Country', 'Country')]

# Get display values
for value, display in GenreType.choices:
    print(f"{value} -> {display}")

# Use in queries
rock_songs = Song.objects.filter(genre=GenreType.ROCK)

# Check value
if song.genre == GenreType.JAZZ:
    print("This is jazz")
```

### MoodType
```python
from domain.models import MoodType

# Available values
MoodType.HAPPY          # "Happy"
MoodType.SAD            # "Sad"
MoodType.ENERGETIC      # "Energetic"
MoodType.CALM           # "Calm"

# Use in queries
happy_songs = Song.objects.filter(mood=MoodType.HAPPY)
```

### OccasionType
```python
from domain.models import OccasionType

# Available values
OccasionType.BIRTHDAY       # "Birthday"
OccasionType.WEDDING        # "Wedding"
OccasionType.FUNERAL        # "Funeral"
OccasionType.PARTY          # "Party"
OccasionType.RELAXATION     # "Relaxation"
OccasionType.WORKOUT        # "Workout"
OccasionType.STUDY          # "Study"
OccasionType.OTHER          # "Other"

# Use in queries
party_songs = Song.objects.filter(occasion=OccasionType.PARTY)
study_songs = Song.objects.filter(occasion=OccasionType.STUDY)
```

### SingerVoiceType
```python
from domain.models import SingerVoiceType

# Available values
SingerVoiceType.MALE        # "Male"
SingerVoiceType.FEMALE      # "Female"
SingerVoiceType.NEUTRAL     # "Neutral"
SingerVoiceType.DUET        # "Duet"

# Use in queries
female_voice = Song.objects.filter(singer_voice=SingerVoiceType.FEMALE)
```

### AudioFormatType
```python
from domain.models import AudioFormatType

# Available values
AudioFormatType.MP3         # "MP3"
AudioFormatType.M4A         # "M4A"
AudioFormatType.WAV         # "WAV"

# Use in queries and defaults
mp3_songs = Song.objects.filter(audio_format=AudioFormatType.MP3)
```

### GenerationStatus
```python
from domain.models import GenerationStatus

# Available values
GenerationStatus.QUEUED         # "Queued"
GenerationStatus.GENERATING     # "Generating"
GenerationStatus.COMPLETED      # "Completed"
GenerationStatus.FAILED         # "Failed"

# Use in queries
in_progress = Song.objects.filter(status=GenerationStatus.GENERATING)
done = Song.objects.filter(status=GenerationStatus.COMPLETED)
errors = Song.objects.filter(status=GenerationStatus.FAILED)

# Use in updates
song.status = GenerationStatus.COMPLETED
song.save()

# Check status
if song.status == GenerationStatus.COMPLETED:
    play_song(song)
```


## 7. COMMON PATTERNS & RECIPES


### User Registration Flow
```python
from domain.models import User

# Create user
user = User.objects.create(
    username="alice",
    email="alice@example.com"
)

# Library is auto-created via signals/post_save (or create manually)
library = user.library  # Gets the one created with user
```

### Song Creation & Generation Workflow
```python
from domain.models import Song, GenerationStatus, GenreType

# 1. User creates song
song = Song.objects.create(
    library=library,
    title="Generated Song",
    genre=GenreType.JAZZ,
    mood="Calm",
    occasion="Study",
    singer_voice="Female",
    prompt="Beautiful jazz melody",
    status=GenerationStatus.QUEUED
)

# 2. Worker picks up song (update status)
song.status = GenerationStatus.GENERATING
song.save()

# 3. After generation completes
song.status = GenerationStatus.COMPLETED
song.duration = 245
song.audio_file_url = "https://cdn.example.com/songs/abc123.mp3"
song.save()

# 4. If generation fails
song.status = GenerationStatus.FAILED
song.save()

# Or regenerate
song.status = GenerationStatus.QUEUED
song.save()
```

### Share Song with Users
```python
from domain.models import ShareLink

# Create share link
share_link = ShareLink.objects.create(song=song)

# Get shareable token
token = share_link.token
# Send to user or generate share URL: https://example.com/songs/share/{token}

# From share URL, retrieve song to play
share_link = ShareLink.objects.get(token=token)
song = share_link.song
print(song.audio_file_url)
```

### Get User's Music Statistics
```python
from django.db.models import Count, Avg

user = User.objects.get(username="alice")
library = user.library

stats = library.songs.aggregate(
    total_songs=Count('id'),
    avg_duration=Avg('duration'),
    genres=Count('genre', distinct=True),
    completed=Count('id', filter=Q(status=GenerationStatus.COMPLETED)),
    failed=Count('id', filter=Q(status=GenerationStatus.FAILED)),
)

print(f"Total songs: {stats['total_songs']}")
print(f"Avg duration: {stats['avg_duration']} seconds")
print(f"Completed: {stats['completed']}")
```

### Backup User Data
```python
import json
from django.core import serializers

user = User.objects.get(username="alice")

# Serialize all user data
data = {
    'user': serializers.serialize('json', [user]),
    'library': serializers.serialize('json', [user.library]),
    'songs': serializers.serialize('json', user.library.songs.all()),
    'share_links': serializers.serialize('json', ShareLink.objects.filter(song__library=user.library))
}

# Save to file
with open(f'backup_{user.username}.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Migration/Data Transfer Example
```python
# Copy songs from one library to another
source_library = Library.objects.get(id=source_id)
target_library = Library.objects.get(id=target_id)

for source_song in source_library.songs.all():
    Song.objects.create(
        library=target_library,
        title=source_song.title,
        genre=source_song.genre,
        mood=source_song.mood,
        occasion=source_song.occasion,
        singer_voice=source_song.singer_voice,
        prompt=source_song.prompt,
        status=source_song.status,
        duration=source_song.duration,
        audio_format=source_song.audio_format,
        audio_file_url=source_song.audio_file_url
    )
```

## 8. BEST PRACTICES


### Do's ✓
- Use .get() for single objects, .filter() for collections
- Use select_related() for foreign keys, prefetch_related() for many-to-many
- Use .values() or .values_list() when you don't need full objects
- Filter before aggregating for better performance
- Use enumerations (GenreType, MoodType) not string literals
- Use Q objects for complex OR conditions
- Use .count() on querysets, not len(list)
- Use .exists() to check if records exist
- Use bulk operations for large updates: .bulk_create(), .bulk_update()

### Don'ts ✗
- Don't use hard-coded strings for enumeration values
- Don't fetch all records then filter in Python (filter in database)
- Don't N+1 query: use select_related/prefetch_related
- Don't assume song_count() is expensive (it calls .count())
- Don't modify primary keys or UUID fields after creation
- Don't create multiple ShareLinks for same Song (OneToOne enforces single)
- Don't create multiple Libraries per User (OneToOne enforces single)


## 9. ERROR HANDLING

```python
from django.core.exceptions import ValidationError
from django.db import IntegrityError

# Handle not found
try:
    user = User.objects.get(id=invalid_id)
except User.DoesNotExist:
    print("User not found")

# Handle multiple found
try:
    user = User.objects.get(username__istartswith="john")
except User.MultipleObjectsReturned:
    print("Multiple users match")

# Handle duplicate key (violates unique constraint)
try:
    user = User.objects.create(username="duplicate", email="duplicate@example.com")
except IntegrityError:
    print("Email or username already exists")

# Handle validation errors
try:
    song = Song.objects.create(
        library=library,
        title="x" * 300,  # Exceeds max length
        ...
    )
except ValidationError as e:
    print(f"Validation error: {e}")

# Handle cascade delete (successful, but may have side effects)
try:
    user.delete()  # Cascades: Library → Songs → ShareLinks
    print("User and all related data deleted")
except Exception as e:
    print(f"Delete failed: {e}")
```


## 10. TRANSACTION HANDLING


```python
from django.db import transaction

# Ensure atomic operation
@transaction.atomic
def create_user_with_library(username, email):
    user = User.objects.create(username=username, email=email)
    library = Library.objects.create(user=user)
    return user, library

# Or use context manager
def batch_create_songs(library, song_data_list):
    with transaction.atomic():
        songs = [
            Song(library=library, **song_data)
            for song_data in song_data_list
        ]
        Song.objects.bulk_create(songs)

# Savepoints for nested transactions
with transaction.atomic():
    song = Song.objects.create(...)
    try:
        with transaction.atomic():
            share_link = ShareLink.objects.create(song=song)
    except IntegrityError:
        # Rollback share_link creation, but song still saved
        pass
```
