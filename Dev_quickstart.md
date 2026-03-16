
# CITHARA - Quick start guide for developer 

## 1. Initial setup (First Time)

```bash
# Navigate to project
cd .../Cithara-ai-music-web

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install Django
pip install django==6.0.2

# Navigate to Django project
cd Cithara

# Run migrations (creates database)
python3 manage.py migrate

# Create admin account
python3 manage.py createsuperuser
# Enter Username: admin
# Enter Email: admin@example.com
# Enter Password: (choose a password)

# Start development server
python3 manage.py runserver

# Access admin at: http://127.0.0.1:8000/admin/
```


## 2. Running the project 

```bash
# From Cithara directory
python3 manage.py runserver

# Then visit:
# Admin: http://127.0.0.1:8000/admin/
# API (future): http://127.0.0.1:8000/api/
```


## 3. Testing CRUD operations

From project root (Cithara-ai-music-web)
```bash
python3 test_crud.py
```
Expected output: <br>
✓ CREATE Operations: Entities created successfully <br>
✓ READ Operations: Entities retrieved and filtered<br>
✓ UPDATE Operations: Attributes modified and saved <br>
✓ DELETE Operations: Cascade delete verified <br>
Data Integrity Check: All verified <br>
✓✓✓ All CRUD operations successful!



## 4. Domain model

### User
```python
from domain.models import User

# Create
user = User.objects.create(
    username="john_doe",
    email="john@example.com"
)

# Read
user = User.objects.get(username="john_doe")
print(user.email)

# Update
user.email = "john.new@example.com"
user.save()

# Delete
user.delete()

# Access user's library
library = user.library
```

### Library
```python
from domain.models import Library

# Create
library = Library.objects.create(user=user)

# Read
library = user.library
print(f"Songs in library: {library.song_count()}")

# Get all songs
songs = library.songs.all()

# Delete
library.delete()  # Cascades to songs and share links
```

### Song
```python
from domain.models import Song, GenerationStatus

# Create
song = Song.objects.create(
    library=library,
    title="My Song",
    genre="Jazz",              # Must be: Rock, Pop, Jazz, HipHop, Country
    mood="Happy",              # Must be: Happy, Sad, Energetic, Calm
    occasion="Party",          # Must be: Birthday, Wedding, Funeral, Party...
    singer_voice="Male",       # Must be: Male, Female, Neutral, Duet
    prompt="Beautiful melody",  # Max 1000 characters
    status=GenerationStatus.QUEUED,
    duration=180,              # Max 900 seconds
    audio_format="MP3"         # Must be: MP3, M4A, WAV
)

# Read
song = Song.objects.get(id=song_id)
print(f"Status: {song.status}")

# Query
completed = Song.objects.filter(status=GenerationStatus.COMPLETED)
jazz_songs = Song.objects.filter(genre="Jazz")

# Update
song.status = GenerationStatus.COMPLETED
song.audio_file_url = "https://example.com/song.mp3"
song.save()

# Helper methods
if song.is_ready():
    print("Song is ready to play")
if song.is_generating():
    print("Please wait...")
if song.is_failed():
    print("Regenerate the song")

# Delete
song.delete()  # Cascades to share_link
```

### ShareLink
```python
from domain.models import ShareLink

# Create (auto-generates token)
share_link = ShareLink.objects.create(song=song)

# Read
share_link = song.share_link
print(f"Token: {share_link.token}")

# Access song from link
song = share_link.song

# Delete
share_link.delete()
```

## 5. Enumeration values
```python
from domain.models import (
    GenreType, MoodType, OccasionType, 
    SingerVoiceType, AudioFormatType, GenerationStatus
)

# Get all choices
print(GenreType.choices)
# Output: [('Rock', 'Rock'), ('Pop', 'Pop'), ('Jazz', 'Jazz'), ...]

# Use in queries
rock_songs = Song.objects.filter(genre=GenreType.ROCK)

# Check values
if song.genre == GenreType.JAZZ:
    print("This is a jazz song")

# Available values
GenreType.ROCK          # "Rock"
GenreType.POP           # "Pop"
GenreType.JAZZ          # "Jazz"
GenreType.HIPHOP        # "HipHop"
GenreType.COUNTRY       # "Country"

MoodType.HAPPY          # "Happy"
MoodType.SAD            # "Sad"
MoodType.ENERGETIC      # "Energetic"
MoodType.CALM           # "Calm"

OccasionType.BIRTHDAY   # "Birthday"
OccasionType.WEDDING    # "Wedding"
OccasionType.FUNERAL    # "Funeral"
OccasionType.PARTY      # "Party"
OccasionType.RELAXATION # "Relaxation"
OccasionType.WORKOUT    # "Workout"
OccasionType.STUDY      # "Study"
OccasionType.OTHER      # "Other"

SingerVoiceType.MALE    # "Male"
SingerVoiceType.FEMALE  # "Female"
SingerVoiceType.NEUTRAL # "Neutral"
SingerVoiceType.DUET    # "Duet"

AudioFormatType.MP3     # "MP3"
AudioFormatType.M4A     # "M4A"
AudioFormatType.WAV     # "WAV"

GenerationStatus.QUEUED      # "Queued"
GenerationStatus.GENERATING  # "Generating"
GenerationStatus.COMPLETED   # "Completed"
GenerationStatus.FAILED      # "Failed"
```


## 6. Django admin usage 

### Login
1. Go to: http://127.0.0.1:8000/admin/
2. Username: admin
3. Password: (what you set during setup)

### Create a User
1. Click "Users" → "Add User"
2. Fill in:
   - Username: alice
   - Email: alice@example.com
3. Click "Save"

### Create a Library
1. Click "Libraries" → "Add Library"
2. Select the User
3. Click "Save"

### Create a Song
1. Click "Songs" → "Add Song"
2. Fill in:
   - Library: (select the user's library)
   - Title: Beautiful Melody
   - Genre: Jazz
   - Mood: Calm
   - Occasion: Study
   - Singer voice: Female
   - Prompt: (optional, max 1000 chars)
   - Status: Queued
   - Duration: (will be filled when generated)
   - Audio format: MP3
3. Click "Save"

### Create a ShareLink
1. Click "Share links" → "Add Share link"
2. Select the Song
3. Click "Save" (token auto-generates)

### Delete with Cascade
1. Go to Songs
2. Click on a song
3. Click "Delete"
4. Confirm deletion
5. Note: ShareLink automatically deleted


## 7. Common tasks

### Query all songs by a user
```python
user = User.objects.get(username="alice")
songs = user.library.songs.all()
```

### Find songs in a particular genre
```python
from domain.models import GenreType
jazz_songs = Song.objects.filter(genre=GenreType.JAZZ)
```

### Update song status after generation
```python
song = Song.objects.get(id=song_id)
song.status = GenerationStatus.COMPLETED
song.duration = 240
song.audio_file_url = "https://example.com/song.mp3"
song.save()
```

### Get share link for a song
```python
song = Song.objects.get(title="My Song")
share_link = song.share_link
print(f"Share token: {share_link.token}")
```

### Delete a user and all their data
```python
user = User.objects.get(username="alice")
user.delete()
# This cascades: User → Library → Songs → ShareLinks
```

### Count songs by status
```python
from domain.models import GenerationStatus
completed = Song.objects.filter(status=GenerationStatus.COMPLETED).count()
generating = Song.objects.filter(status=GenerationStatus.GENERATING).count()
print(f"Completed: {completed}, Generating: {generating}")
```


## 8. Troubleshooting

### Database locked error
```bash
rm Cithara/db.sqlite3
python3 manage.py migrate
```

### "No such table" error
```bash
python3 manage.py migrate
```

### Cannot import models
```bash
# Make sure you're in the right directory
cd Cithara
# And run migrate first
python3 manage.py migrate
```

### Forgot superuser password
```bash
# Create a new superuser
python3 manage.py createsuperuser
```

### Port 8000 already in use
```bash
# Use a different port
python3 manage.py runserver 8001
```

### Want to reset everything
```bash
rm db.sqlite3
python3 manage.py migrate
python3 manage.py createsuperuser
```


## 9. File Structure 

```
Cithara-ai-music-web/
├── Cithara/                 # Django project directory
│   ├── manage.py           # Main management script
│   ├── db.sqlite3          # Database file
│   ├── Cithara/            # Project settings
│   │   ├── settings.py     # Django configuration
│   │   └── urls.py         # URL routing
│   └── domain/             # Domain app
│       ├── models.py       # Model definitions
│       ├── admin.py        # Admin configuration
│       └── migrations/     # Database migrations
├── test_crud.py             # CRUD test script
├── README.md                # Project documentation
└── IMPLEMENTATION_REPORT.md # This implementation report
```



## 10. Key commands 

```bash
# Migrations
python3 manage.py makemigrations domain
python3 manage.py migrate
python3 manage.py showmigrations

# Server
python3 manage.py runserver
python3 manage.py runserver 0.0.0.0:8000

# Admin
python3 manage.py createsuperuser
python3 manage.py changepassword admin

# Testing
python3 manage.py test
python3 test_crud.py

# Database
python3 manage.py dbshell

# Check
python3 manage.py check
```


