import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Cithara.settings')
django.setup()

from domain.models import Song, Library, User
from domain.strategies.factory import get_generator_strategy

user, _ = User.objects.get_or_create(username="strattest", email="strat@test.com")
library, _ = Library.objects.get_or_create(user=user)

print("--- Testing Mock Strategy ---")
os.environ['GENERATOR_STRATEGY'] = 'mock'
song_mock = Song.objects.create(
    library=library,
    title="Mock Test Song",
    genre="Pop",
    mood="Happy",
    occasion="Party",
    singer_voice="Male",
    prompt="A cool pop song"
)
strat = get_generator_strategy()
res = strat.generate(song_mock)
print("Generate Response:", res)
res2 = strat.check_status(song_mock)
print("Check Status Response:", res2)

print("\n--- Testing Suno Strategy (Expected to fail without valid API key) ---")
os.environ['GENERATOR_STRATEGY'] = 'suno'
os.environ['SUNO_API_KEY'] = 'fake_key_123'
song_suno = Song.objects.create(
    library=library,
    title="Suno Test Song",
    genre="Rock",
    mood="Energetic",
)
strat_suno = get_generator_strategy()
res_suno = strat_suno.generate(song_suno)
print("Generate Response:", res_suno)
