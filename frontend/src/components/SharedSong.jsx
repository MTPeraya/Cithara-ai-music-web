import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function SharedSong({ token }) {
  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const data = await api.getSongByToken(token);
        setSong(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [token]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
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
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fade-in">
          <div className="flex items-end justify-center gap-1.5 h-16 mb-6">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="w-3 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500 wave-bar" style={{ height: '40px' }}></div>
            ))}
          </div>
          <p className="text-slate-500 font-medium">Loading shared song...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fade-in max-w-md px-6">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-red-50 border border-red-100">
            <svg width="40" height="40" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Song Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'This share link may have expired or been removed.'}</p>
          <a href="/" className="btn-primary px-8 py-3 rounded-xl font-medium text-white inline-block">
            Go to Cithara →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-md border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="24" cy="24" r="4" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">Cithara</span>
          </a>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
            Shared Song
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full animate-slide-up">
          {/* Album Art Placeholder */}
          <div className="w-full aspect-square max-w-xs mx-auto rounded-3xl flex items-center justify-center mb-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-2xl shadow-indigo-200">
            <svg width="80" height="80" fill="white" viewBox="0 0 24 24" className="opacity-80">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>

          {/* Song Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{song.title}</h1>
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{song.genre}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{song.mood}</span>
              {song.occasion && song.occasion !== 'Other' && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{song.occasion}</span>
                </>
              )}
            </div>
          </div>

          {/* Audio Player */}
          {song.audio_file_url ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <audio
                ref={audioRef}
                src={song.audio_file_url}
                referrerPolicy="no-referrer"
                className="hidden"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Play Button */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full flex items-center justify-center btn-primary shadow-xl shadow-indigo-200 hover:scale-110 active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <span className="mono text-xs font-bold text-slate-400">{formatTime(currentTime)}</span>
                <div
                  className="flex-1 h-2 rounded-full cursor-pointer bg-slate-100 overflow-hidden group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="mono text-xs font-bold text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                {song.status === 'Completed' ? 'Audio unavailable' : `Song is ${song.status.toLowerCase()}...`}
              </p>
            </div>
          )}

          {/* Create CTA */}
          <div className="text-center mt-10">
            <a href="/" className="text-indigo-600 font-semibold hover:text-indigo-500 transition-colors text-sm">
              ✨ Create your own AI song on Cithara →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
