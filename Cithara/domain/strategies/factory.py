from django.conf import settings
from .base import SongGeneratorStrategy
from .mock_strategy import MockSongGeneratorStrategy
from .suno_strategy import SunoSongGeneratorStrategy

def get_generator_strategy() -> SongGeneratorStrategy:
    """
    Factory function to retrieve the active song generation strategy.
    The strategy is selected based on the GENERATOR_STRATEGY setting.
    """
    strategy_name = getattr(settings, "GENERATOR_STRATEGY", "mock").lower()
    
    if strategy_name == "suno":
        return SunoSongGeneratorStrategy()
    
    # Default to mock
    return MockSongGeneratorStrategy()
