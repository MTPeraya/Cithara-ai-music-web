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
  const [user, setUser] = useState(null);
  const [library, setLibrary] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  // Check for share link hash and session on mount
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

    // Restore session from localStorage
    const savedUserId = localStorage.getItem('cithara_user_id');
    const savedLibraryId = localStorage.getItem('cithara_library_id');
    const savedUsername = localStorage.getItem('cithara_username');
    const savedEmail = localStorage.getItem('cithara_email');

    if (savedLibraryId && savedUserId) {
      setCurrentLibraryId(savedLibraryId);
      setUser({ username: savedUsername, email: savedEmail, id: savedUserId });
      setCurrentPage('library');
    }

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
        occasion: song.occasion,
        singer_voice: song.singer_voice,
        prompt: song.prompt,
        date: new Date(song.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        audio_url: song.audio_file_url,
        duration: song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2, '0')}` : '0:00'
      })));
    } catch (e) { console.error(e); }
  };

  const handleSignInSuccess = (libraryId, userData) => {
    setCurrentLibraryId(libraryId);
    setUser(userData);
    
    // Save to localStorage
    if (userData?.id) {
      localStorage.setItem('cithara_user_id', userData.id);
      localStorage.setItem('cithara_library_id', libraryId);
      localStorage.setItem('cithara_username', userData.username);
      localStorage.setItem('cithara_email', userData.email);
    }
    
    setCurrentPage('library');
  };

  const handleLogout = () => {
    localStorage.removeItem('cithara_user_id');
    localStorage.removeItem('cithara_library_id');
    localStorage.removeItem('cithara_username');
    localStorage.removeItem('cithara_email');

    setCurrentLibraryId(null);
    setUser(null);
    setLibrary([]);
    setCurrentSongIndex(null);
    setIsPlaying(false);
    setCurrentPage('signin');
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
    return <SharedSong token={shareToken} user={user} />;
  }

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleComposeNew = () => {
    setCurrentSongIndex(null);
    setCurrentPage('create');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-800">
      {currentPage !== 'signin' && (
        <Header currentPage={currentPage} setCurrentPage={handleNavigate} onComposeNew={handleComposeNew} user={user} onLogout={handleLogout} />
      )}
      
      <main className="flex-1 overflow-auto">
        {currentPage === 'signin' && <SignIn onSuccess={handleSignInSuccess} />}
        {currentPage === 'library' && (
          <Library 
            library={library} 
            setCurrentPage={handleNavigate}
            onComposeNew={handleComposeNew}
            currentSongIndex={currentSongIndex}
            setCurrentSongIndex={setCurrentSongIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        )}
        {(currentPage === 'create' || currentPage === 'review' || currentPage === 'generating') && (
          <CreateFlow 
            currentPage={currentPage} 
            setCurrentPage={handleNavigate}
            currentLibraryId={currentLibraryId}
            editingSong={currentSongIndex !== null ? library[currentSongIndex] : null}
            onGenerationComplete={() => {
              loadLibrary().then(() => handleNavigate('library'));
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

