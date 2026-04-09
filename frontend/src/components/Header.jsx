export default function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="px-6 py-4 border-b flex items-center justify-between bg-white border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('signin')}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="4" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-800">Cithara</span>
      </div>
      <nav className="flex items-center gap-6">
        <button 
          onClick={() => setCurrentPage('create')} 
          className={`text-sm font-medium transition-all hover:opacity-70 ${(currentPage === 'create' || currentPage === 'review' || currentPage === 'generating') ? 'text-indigo-500' : 'text-slate-500'}`}
        >
          Create
        </button>
        <button 
          onClick={() => setCurrentPage('library')} 
          className={`text-sm font-medium transition-all hover:opacity-70 ${currentPage === 'library' ? 'text-indigo-500' : 'text-slate-500'}`}
        >
          Library
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white bg-slate-500" title="User Session">
          U
        </div>
      </nav>
    </header>
  );
}
