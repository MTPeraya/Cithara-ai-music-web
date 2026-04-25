import { useState } from 'react';

export default function Header({ currentPage, setCurrentPage, onComposeNew, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('library')}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="4" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">Cithara</span>
      </div>
      <nav className="flex items-center gap-8">
        <button 
          onClick={onComposeNew} 
          className={`text-sm font-bold transition-all hover:opacity-70 tracking-wide uppercase ${(currentPage === 'create' || currentPage === 'review' || currentPage === 'generating') ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Create
        </button>
        <button 
          onClick={() => setCurrentPage('library')} 
          className={`text-sm font-bold transition-all hover:opacity-70 tracking-wide uppercase ${currentPage === 'library' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Library
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white bg-slate-800 shadow-lg shadow-slate-200 border-2 border-white ring-1 ring-slate-100 hover:scale-105 transition-transform"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>
          
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.username || 'Demo Artist'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || 'creator@cithara.ai'}</p>
                </div>
                <button 
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
