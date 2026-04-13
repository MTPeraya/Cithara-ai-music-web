export default function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('signin')}>
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
          onClick={() => setCurrentPage('create')} 
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
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white bg-slate-800 shadow-lg shadow-slate-200 border-2 border-white ring-1 ring-slate-100" title="User Session">
          U
        </div>
      </nav>
    </header>
  );
}
