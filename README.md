# Cithara - AI Music Web Generator 

> A Django-based web application for generating AI music.

## Overview

This project implements the **domain layer** for Cithara, an AI-powered music generation platform. It follows the domain model from Exercise 2 (Model&Supporting_notes.pdf) and provides a robust foundation for persistence, relationships, and domain constraints.

### Key Features

- **Domain Models**: User, Library, Song, and ShareLink entities with proper relationships
- **Constraints & Validation**: Domain rules enforced at the model level
- **Enumerations**: Type-safe choices for Genre, Mood, Occasion, Voice, AudioFormat, and GenerationStatus
- **Relationships**: 1:1 and 1:M relationships with cascade delete support
- **Database Persistence**: SQLite with proper schema and migrations
- **CRUD Operations**: Django Admin interface for Create, Read, Update, Delete operations
- **Admin Interface**: User-friendly admin panels for all domain entities

## Domain Model

The domain layer consists of four core entities:

### 1. User
Represents an authenticated user of the system.
- **Attributes**: id (UUID), email, username, created_at
- **Constraints**: Email and username are unique
- **Relationships**: 1:1 with Library

### 2. Library
Represents a user's personal song library.
- **Attributes**: id (UUID), created_at
- **Constraints**: 0 to 1,000,000 songs per library
- **Relationships**: 1:1 with User, 1:M with Song

### 3. Song
Represents a generated or to-be-generated song.
- **Attributes**:
  - title: Song name
  - genre: One of {Rock, Pop, Jazz, HipHop, Country}
  - mood: One of {Happy, Sad, Energetic, Calm}
  - occasion: One of {Birthday, Wedding, Funeral, Party, Relaxation, Workout, Study, Other}
  - singer_voice: One of {Male, Female, Neutral, Duet}
  - prompt: Extended description (max 1000 characters)
  - status: One of {Queued, Generating, Completed, Failed}
  - duration: Song length in seconds (max 900/15 minutes)
  - audio_format: One of {MP3, M4A, WAV}
  - audio_file_url: Link to generated audio
  - created_at, updated_at: Timestamps
- **Constraints**: 
  - Duration ≤ 900 seconds
  - Prompt ≤ 1000 characters
- **Relationships**: M:1 with Library, 1:1 Composition with ShareLink

### 4. ShareLink
Represents a unique shareable link for a song.
- **Attributes**: id (UUID), token (unique), created_at
- **Constraints**: One link per song, auto-deleted with song
- **Relationships**: 1:1 Composition with Song (cascade delete)

## Installation & Setup

### Prerequisites

- Python 3.9+
- pip (Python package manager)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/MTPeraya/Cithara-ai-music-web.git
cd Cithara-ai-music-web
```

### Step 2: Create a Virtual Environment (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install django==6.0.2 djangorestframework==3.14.0
```

The `djangorestframework` package is required for REST API endpoints.

### Step 4: Run Migrations

Navigate to the project directory containing `manage.py`:

```bash
cd Cithara
python3 manage.py migrate
```

This creates the SQLite database with all necessary tables and indexes.

### Step 5: Create a Superuser (Admin Account)

```bash
python3 manage.py createsuperuser
```

Follow the prompts to create an admin account. Example:
```
Username: admin
Email: admin@example.com
Password: (secure password)
```

### Step 6: Start the Development Server

```bash
python3 manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

### Step 7: Access Django Admin

1. Navigate to `http://127.0.0.1:8000/admin/`
2. Log in with the superuser credentials created in Step 5
3. Manage users, libraries, songs, and share links

## REST API Documentation

> The REST API provides programmatic access to all CRUD operations and is implemented using Django REST Framework.

### API Base URL
```
http://127.0.0.1:8000/api/
```

### API Endpoints

#### Users

**List all users**
```
GET /api/users/
```

**Create a new user**
```
POST /api/users/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Retrieve a specific user**
```
GET /api/users/{id}/
```

**Update a user**
```
PUT /api/users/{id}/
Content-Type: application/json

{
  "username": "jane_doe",
  "email": "jane@example.com"
}
```

**Delete a user**
```
DELETE /api/users/{id}/
```

---

#### Libraries

**List all libraries**
```
GET /api/libraries/
```

**Create a new library**
```
POST /api/libraries/
Content-Type: application/json

{
  "user": "user-id-uuid"
}
```

**Retrieve a specific library**
```
GET /api/libraries/{id}/
```

**Get all songs in a library**
```
GET /api/libraries/{id}/songs/
```

**Delete a library**
```
DELETE /api/libraries/{id}/
```

---

#### Songs

**List all songs**
```
GET /api/songs/
```

**Create a new song**
```
POST /api/songs/
Content-Type: application/json

{
  "library": "library-id-uuid",
  "title": "Morning Coffee Mood",
  "genre": "Jazz",
  "mood": "Calm",
  "occasion": "Study",
  "singer_voice": "Male",
  "prompt": "Smooth jazz instrumental for morning relaxation",
  "status": "Queued",
  "audio_format": "MP3"
}
```

**Retrieve a specific song**
```
GET /api/songs/{id}/
```

**Update a song**
```
PUT /api/songs/{id}/
Content-Type: application/json

{
  "title": "Updated Song Title",
  "status": "Generating"
}
```

**Regenerate a song** (reset status to Queued)
```
POST /api/songs/{id}/regenerate/
```

**Delete a song** (cascade deletes share link)
```
DELETE /api/songs/{id}/
```

---

#### Share Links

**List all share links**
```
GET /api/share-links/
```

**Create a share link for a song**
```
POST /api/share-links/
Content-Type: application/json

{
  "song": "song-id-uuid"
}
```

**Retrieve a share link**
```
GET /api/share-links/{id}/
```

**Access a shared song by token**
```
GET /api/share-links/by-token/?token=YOUR_TOKEN_HERE
```

Example response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "library": "...",
  "title": "Morning Coffee Mood",
  "genre": "Jazz",
  "mood": "Calm",
  "status": "Completed",
  "audio_file_url": "https://example.com/audio.mp3",
  "share_link": {
    "id": "...",
    "token": "abc123xyz",
    "created_at": "2024-03-22T10:30:00Z"
  }
}
```

---

### API Response Format

All responses are in JSON format:

**Success Response** (2xx status code):
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2",
  "created_at": "2024-03-22T10:30:00Z"
}
```

**Error Response** (4xx/5xx status code):
```json
{
  "error": "Error description"
}
```

### Testing the API

You can test the API endpoints using:
- **curl**
- **Postman** 
- **Python requests**
- **VS Code REST Client**

Example with curl:
```bash
# Create a user
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'

# List all users
curl http://127.0.0.1:8000/api/users/

# Get a user by ID
curl http://127.0.0.1:8000/api/users/your-user-uuid/

# Delete a user
curl -X DELETE http://127.0.0.1:8000/api/users/your-user-uuid/
```

## CRUD Operations via Django Admin

The Django Admin interface provides complete CRUD functionality and this is the primary evidence for CRUD operations in the current implementation.

### Evidence of CRUD Functionality
- `Cithara/domain/admin.py` registers all domain models so they can be created/read/updated/deleted through the Django Admin UI.
- `test_crud.py` runs an end-to-end script that performs create, read, update, and delete operations and verifies the final state.
- The Admin interface at `/admin/` demonstrates real-world CRUD operations interactively.

### Create
1. Log into Django Admin (`/admin`)
2. Click on any model (User, Library, Song, ShareLink)
3. Click "Add User/Library/Song/ShareLink" button
4. Fill in the form and click "Save"

### Read
1. View lists of any entity with filters and search
2. Details pages show all attributes with helpful descriptions

### Update
1. Click on any existing record in the list
2. Edit fields and click "Save"
3. Changes are persisted to the database immediately

### Delete
1. Select records using checkboxes
2. Choose "Delete selected" from action dropdown
3. Confirm deletion (cascade delete applies - e.g., deleting a Song auto-deletes its ShareLink)

### Example: Creating a Song via Admin

1. Create a User (e.g., "john_doe", "john@example.com")
2. Create a Library (select the user)
3. Create a Song:
   - Title: "Morning Coffee Mood"
   - Genre: Jazz
   - Mood: Calm
   - Occasion: Study
   - Singer Voice: Male
   - Prompt: "Smooth jazz instrumental for morning relaxation"
   - Status: Queued
4. Create a ShareLink for the song (auto-generates token)

## Testing CRUD Operations

A test script is provided to verify all CRUD operations:

```bash
cd Cithara-ai-music-web
python3 test_crud.py
```

Expected output:
```
✓ CREATE Operations: Entities created successfully
✓ READ Operations: Entities retrieved and queried
✓ UPDATE Operations: Attributes modified and saved
✓ DELETE Operations: Cascade delete verified
✓ Data Integrity Check: Final state verified
✓✓✓ All CRUD operations successful!
```

## Database Schema

The domain layer creates the following tables:

- **users**: User accounts (UUID primary key, unique email/username)
- **libraries**: User libraries (UUID, 1:1 with users)
- **songs**: Song records (UUID, FK to libraries, indexed by status and created_at)
- **share_links**: Shareable song links (UUID, 1:1 with songs, cascade delete)

All UUIDs are indexed for efficient queries. Timestamps track entity lifecycle.

## Key Design Decisions

### 1. UUID Primary Keys
All entities use UUID instead of auto-incrementing IDs for:
- Better scalability
- Distributed system compatibility  
- Privacy (IDs are not sequential)

### 2. Composition Relationships
ShareLink uses composition with Song (on_delete=CASCADE) to enforce:
- Lifecycle dependency
- Data integrity (no orphaned links)
- Automatic cleanup

### 3. Enumerations
Genre, Mood, etc. use Django TextChoices to:
- Prevent invalid values
- Maintain data consistency
- Provide type safety

### 4. Minimal Attributes
Only attributes required by domain constraints are included (no over-engineering)

## Domain Constraints

The model enforces these business rules:

1. **User & Library**: Each user owns exactly one library (1:1)
2. **Library & Song**: A library can contain 0-1,000,000 songs (1:M)
3. **Song Duration**: Maximum 15 minutes (900 seconds)
4. **Prompt Length**: Maximum 1,000 characters
5. **Share Links**: One link per song, deleted with song
6. **Status Tracking**: Songs progress through Queued → Generating → Completed/Failed
7. **Audio Format**: Only MP3, M4A, WAV supported

## API for Developers

The Song model provides utility methods:

```python
from domain.models import Song

song = Song.objects.get(id='...')

# Check if generation is complete
if song.is_ready():
    print(f"Song ready: {song.audio_file_url}")

# Check if generation failed
if song.is_failed():
    print("Regenerate the song")

# Check if still generating
if song.is_generating():
    print("Please wait...")
```

## Future Expansions

The domain layer is designed to support:
- API endpoints (Django REST Framework)
- AI service integration (Suno AI)
- Advanced filtering and search
- Batch operations
- Event-driven architecture

## Troubleshooting

### Database Locked Error
```bash
# Delete the database and restart
rm Cithara/db.sqlite3
python3 manage.py migrate
```

### Migration Issues
```bash
# Show migration status
python3 manage.py showmigrations

# Recreate migrations if needed
rm Cithara/domain/migrations/0*.py
python3 manage.py makemigrations domain
```

### Superuser Issues  
```bash
# Create a new superuser
python3 manage.py createsuperuser
```



