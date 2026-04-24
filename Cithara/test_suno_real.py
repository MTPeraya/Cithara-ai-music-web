import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Cithara.settings')
os.environ['GENERATOR_STRATEGY'] = 'suno'
os.environ['SUNO_API_KEY'] = 'fake_key_123'
django.setup()

from domain.models import Song, Library, User
from domain.strategies.strategy_factory import get_generator_strategy

user = User.objects.first()
library = Library.objects.first()

print("\n--- Testing Suno Strategy (Expected to fail without valid API key) ---")
song_suno = Song.objects.create(
    library=library,
    title="Suno Test Song",
    genre="Rock",
    mood="Energetic",
)
strat_suno = get_generator_strategy()
res_suno = strat_suno.generate(song_suno)
print("Generate Response:", res_suno)
