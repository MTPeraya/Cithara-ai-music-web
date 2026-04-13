import { useRef, useEffect, useState } from 'react';

export default function Player({ song, isPlaying, setIsPlaying, onDelete }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      // Force reload if playing a new song
      audioRef.current.load();
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Audio playback failed:", e);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [song.audio_url]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Audio playback failed:", e);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!song) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border-t p-6 bg-white/80 backdrop-blur-md border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 relative">
      {/* Hidden audio element — playback is controlled via the custom UI below */}
      <audio 
        ref={audioRef}
        src={song.audio_url}
        referrerPolicy="no-referrer"
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-100">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-lg text-slate-900 truncate leading-tight">{song.title}</h4>
              <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{song.genre} • {song.mood}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => {
                const newIsPlaying = !isPlaying;
                setIsPlaying(newIsPlaying);
                if (audioRef.current) {
                  if (newIsPlaying) {
                    audioRef.current.play().catch(e => console.error("Sync play failed:", e));
                  } else {
                    audioRef.current.pause();
                  }
                }
              }} 
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 btn-primary shadow-xl shadow-indigo-200 disabled:opacity-50"
              disabled={!song.audio_url}
              title={song.audio_url ? (isPlaying ? "Pause" : "Play") : "Audio fully generating/missing"}
            >
              {isPlaying ? (
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 rounded-xl transition-all hover:bg-slate-50 text-slate-400 hover:text-indigo-600" title="Share">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-3 rounded-xl transition-all hover:bg-red-50 text-slate-400 hover:text-red-500 group" title="Delete"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <span className="mono text-xs font-bold text-slate-400">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-2 rounded-full cursor-pointer bg-slate-100 overflow-hidden group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 group-hover:from-indigo-400 group-hover:to-purple-400"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="mono text-xs font-bold text-slate-400">{formatTime(duration) !== "0:00" ? formatTime(duration) : (song.duration || "0:00")}</span>
        </div>
      </div>
    </div>
  );
}
