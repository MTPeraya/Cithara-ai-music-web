import { useState, useEffect } from 'react';
import Header from './components/Header';
import SignIn from './components/SignIn';
import Library from './components/Library';
import CreateFlow from './components/CreateFlow';
import Player from './components/Player';
import SharedSong from './components/SharedSong';
import { api } from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('signin');
  const [currentLibraryId, setCurrentLibraryId] = useState(null);
  const [library, setLibrary] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  // Check for share link hash on mount
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/share\/(.+)$/);
      if (match) {
        setShareToken(match[1]);
      } else {
        setShareToken(null);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    if (currentPage === 'library' && !shareToken) {
      loadLibrary();
    }
  }, [currentPage, currentLibraryId]);

  const loadLibrary = async () => {
    if (!currentLibraryId) return;
    try {
      const data = await api.getSongs(currentLibraryId);
      setLibrary(data.map(song => ({
        id: song.id,
        title: song.title,
        genre: song.genre,
        mood: song.mood,
        status: song.status,
        date: new Date(song.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        audio_url: song.audio_file_url,
        duration: song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2, '0')}` : '0:00'
      })));
    } catch (e) { console.error(e); }
  };

  const handleSignInSuccess = (libraryId) => {
    setCurrentLibraryId(libraryId);
    setCurrentPage('library');
  };

  const handleDeleteSong = async (index) => {
    const songId = library[index].id;
    try {
      await api.deleteSong(songId);
      const newLibrary = [...library];
      newLibrary.splice(index, 1);
      setLibrary(newLibrary);

      if (currentSongIndex === index) {
        setCurrentSongIndex(null);
        setIsPlaying(false);
      } else if (currentSongIndex > index) {
        setCurrentSongIndex(currentSongIndex - 1);
      }
    } catch(e) { console.error(e); }
  };

  // Render shared song page if share token is present
  if (shareToken) {
    return <SharedSong token={shareToken} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-800">
      {currentPage !== 'signin' && (
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
      
      <main className="flex-1 overflow-auto">
        {currentPage === 'signin' && <SignIn onSuccess={handleSignInSuccess} />}
        {currentPage === 'library' && (
          <Library 
            library={library} 
            setCurrentPage={setCurrentPage} 
            currentSongIndex={currentSongIndex}
            setCurrentSongIndex={setCurrentSongIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        )}
        {(currentPage === 'create' || currentPage === 'review' || currentPage === 'generating') && (
          <CreateFlow 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            currentLibraryId={currentLibraryId}
            onGenerationComplete={() => {
              loadLibrary().then(() => setCurrentPage('library'));
            }}
          />
        )}
      </main>

      {currentSongIndex !== null && currentPage === 'library' && (
        <Player 
          song={library[currentSongIndex]}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onDelete={() => handleDeleteSong(currentSongIndex)}
        />
      )}
    </div>
  );
}

export default App;

