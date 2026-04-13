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
        <div className="text-center py-20 animate-fade-in bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-slate-50 border border-slate-100 shadow-inner">
            <svg width="40" height="40" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <p className="text-xl font-semibold text-slate-800 mb-2">Your stage is empty</p>
          <p className="text-slate-500 mb-6">Create your first AI-powered masterpiece today.</p>
          <button onClick={() => setCurrentPage('create')} className="btn-primary px-8 py-3 rounded-xl font-bold">
            Create your first song →
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {library.map((song, i) => (
            <div 
              key={song.id}
              className={`group flex items-center gap-5 p-5 bg-white rounded-3xl border border-slate-100 card-hover cursor-pointer animate-slide-up ${currentSongIndex === i ? 'ring-2 ring-indigo-500 shadow-indigo-100 bg-indigo-50/20' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => playSong(i)}
            >
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                {currentSongIndex === i && isPlaying ? (
                  <div className="flex items-end gap-0.5 h-6">
                    {[1,2,3,4].map(n => <div key={n} className="w-1 rounded-full wave-bar bg-indigo-500"></div>)}
                  </div>
                ) : (
                  <div className={`transition-transform duration-300 ${currentSongIndex === i ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <svg width="28" height="28" fill="#6366f1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 truncate mb-0.5">{song.title}</h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{song.genre}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{song.mood}</span>
                  <span className="text-slate-400">•</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs uppercase tracking-wider ${song.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                    {song.status}
                  </span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="mono text-base font-bold text-slate-900 tracking-tight">{song.duration || "---"}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{song.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
