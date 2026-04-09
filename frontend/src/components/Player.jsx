export default function Player({ song, isPlaying, setIsPlaying, onDelete }) {
  if (!song) return null;

  return (
    <div className="border-t p-4 bg-white border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
              <svg width="20" height="20" fill="white"><path d="M4 3v14l5-3v-8l5-3v14"/></svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold truncate text-slate-800">{song.title}</h4>
              <p className="text-sm truncate text-slate-500">{song.genre} • {song.mood}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-indigo-500"
            >
              {isPlaying ? (
                <svg width="20" height="20" fill="white"><rect x="6" y="4" width="3" height="12"/><rect x="11" y="4" width="3" height="12"/></svg>
              ) : (
                <svg width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg transition-all hover:bg-slate-100" title="Share">
              <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-2 rounded-lg transition-all hover:bg-red-50 group" title="Delete"
            >
              <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" className="group-hover:stroke-red-600">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="mono text-xs text-slate-500">0:00</span>
          <div className="flex-1 h-1.5 rounded-full cursor-pointer bg-slate-200">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: '0%' }}></div>
          </div>
          <span className="mono text-xs text-slate-500">{song.duration}</span>
        </div>
      </div>
    </div>
  );
}
