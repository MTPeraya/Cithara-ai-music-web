export default function Library({ library, setCurrentPage, currentSongIndex, setCurrentSongIndex, isPlaying, setIsPlaying }) {
  const playSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Your Library</h2>
          <p className="text-slate-500">{library.length} song{library.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCurrentPage('create')} className="btn-primary px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4v12M4 10h12"/></svg>
          Create New
        </button>
      </div>

      {library.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-slate-100">
            <svg width="32" height="32" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <p className="text-lg text-slate-500">No songs in your library yet</p>
          <button onClick={() => setCurrentPage('create')} className="mt-4 text-sm font-medium text-indigo-500 hover:underline">
            Create your first song →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {library.map((song, i) => (
            <div 
              key={song.id}
              className={`rounded-2xl p-5 card-hover cursor-pointer animate-slide-up bg-white ${currentSongIndex === i ? 'ring-2 ring-indigo-500' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => playSong(i)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50">
                  {currentSongIndex === i && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-6">
                      {[1,2,3].map(n => <div key={n} className="w-1 rounded-full wave-bar bg-indigo-500"></div>)}
                    </div>
                  ) : (
                    <svg width="24" height="24" fill="#6366f1"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-slate-800">{song.title}</h3>
                  <p className="text-sm text-slate-500">{song.genre} • {song.mood} • {song.status}</p>
                </div>
                
                <div className="text-right">
                  <p className="mono text-sm text-slate-800">{song.duration}</p>
                  <p className="text-xs text-slate-500">{song.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
