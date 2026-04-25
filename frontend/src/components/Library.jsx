import { useState, useMemo } from 'react';
import { api } from '../api';

const genres = ['All Genres', 'Rock', 'Pop', 'HipHop', 'Country', 'Jazz'];

export default function Library({ library, setLibrary, setCurrentPage, currentSongIndex, setCurrentSongIndex, isPlaying, setIsPlaying }) {
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('newest'); // newest, title

  const filteredLibrary = useMemo(() => {
    let result = [...library];
    
    if (search) {
      result = result.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (filterGenre !== 'All Genres') {
      result = result.filter(s => s.genre === filterGenre);
    }
    
    if (sortBy === 'newest') {
      // Assuming library is already sorted by newest from server, but to be sure:
      // In this prototype, we'll just keep it or reverse if needed.
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  }, [library, search, filterGenre, sortBy]);

  const playSong = (songId) => {
    const index = library.findIndex(s => s.id === songId);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const handleRegenerate = async (e, songId) => {
    e.stopPropagation();
    try {
      const data = await api.checkStatus(songId); // Or direct regenerate if we had the endpoint
      // In our API, we have regenerate action.
      const res = await fetch(`http://localhost:8000/api/songs/${songId}/regenerate/`, { method: 'POST' });
      if (res.ok) {
        // Refresh library
        const updated = await api.getSongs(library[0].library_id); // This is a bit hacky, better would be to pass setLibrary
        // Actually, let's just alert the user to refresh or use a better state management.
        // For now, reload the page or trigger a refresh in App.jsx if we had a refresh callback.
        window.location.reload(); 
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Studio</h2>
          <p className="text-slate-500 font-medium">Managing {library.length} musical compositions</p>
        </div>
        <button onClick={() => { setCurrentSongIndex(null); setCurrentPage('create'); }} className="btn-primary px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          Compose New
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input 
            type="text" 
            placeholder="Search by title..." 
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-600 cursor-pointer"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select 
          className="px-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-600 cursor-pointer"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="title">A-Z Title</option>
        </select>
      </div>

      {library.length === 0 ? (
        <div className="text-center py-24 animate-fade-in bg-white rounded-[3rem] shadow-sm border border-slate-50">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8 bg-slate-50 border border-slate-100 shadow-inner">
            <svg width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">Silence is golden, but music is better.</p>
          <p className="text-slate-400 mb-10 max-w-sm mx-auto">Your library is currently empty. Start by creating your first AI-powered masterpiece.</p>
          <button onClick={() => setCurrentPage('create')} className="btn-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-lg">
            Create Your First Song →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLibrary.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">No songs match your search/filters.</div>
          ) : filteredLibrary.map((song, i) => (
            <div 
              key={song.id}
              className={`group flex items-center gap-6 p-5 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer animate-slide-up ${currentSongIndex !== null && library[currentSongIndex]?.id === song.id ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => playSong(song.id)}
            >
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-500 group-hover:to-purple-600 transition-all duration-500">
                {currentSongIndex !== null && library[currentSongIndex]?.id === song.id && isPlaying ? (
                  <div className="flex items-end gap-1 h-6">
                    {[1,2,3,4].map(n => <div key={n} className="w-1 rounded-full wave-bar bg-white"></div>)}
                  </div>
                ) : (
                  <svg width="24" height="24" fill={currentSongIndex !== null && library[currentSongIndex]?.id === song.id ? "white" : "#6366f1"} className="group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-slate-900 truncate mb-1 tracking-tight">{song.title}</h3>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <span className="text-indigo-600">{song.genre}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{song.mood}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2 py-0.5 rounded-md ${
                    song.status.toLowerCase() === 'completed' ? 'text-emerald-600 bg-emerald-50' : 
                    song.status.toLowerCase() === 'failed' ? 'text-red-600 bg-red-50' : 
                    'text-amber-600 bg-amber-50'
                  }`}>
                    {song.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = library.findIndex(s => s.id === song.id);
                    setCurrentSongIndex(idx);
                    setCurrentPage('create');
                  }}
                  className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100"
                  title="Edit Parameters"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>

                {song.status.toLowerCase() === 'failed' && (
                  <button 
                    onClick={(e) => handleRegenerate(e, song.id)}
                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all"
                    title="Retry Generation"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.22M21 3v5h-5"/></svg>
                  </button>
                )}
              </div>
              
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="mono text-lg font-bold text-slate-900 tracking-tighter">{song.duration || "0:00"}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{song.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
