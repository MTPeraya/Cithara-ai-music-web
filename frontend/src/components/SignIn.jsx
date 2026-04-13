import { api } from '../api';

export default function SignIn({ onSuccess }) {
  const handleSignIn = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;

    if (!username || !email) {
      alert('Please provide a username and email to continue.');
      return;
    }

    const userId = await api.createOrGetUser(username, email);
    if (!userId) {
      alert('Failed to connect or create user. Please check backend.');
      return;
    }

    const libraryId = await api.getOrCreateLibrary(userId);
    if (libraryId) {
      onSuccess(libraryId);
    } else {
      alert('Could not set up library.');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="text-center animate-fade-in w-full max-w-md px-6">
        <div className="mb-10">
          <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="24" r="6" fill="white" />
              <path d="M30 24H42" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M6 24H18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-3 text-slate-900 tracking-tight">Cithara</h1>
          <p className="text-xl text-slate-500">Transforming prompts into music.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 animate-slide-up">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">Join the Studio</h3>
          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Username</label>
              <input 
                name="username" 
                type="text" 
                placeholder="e.g. music_maker" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                required 
              />
            </div>
            <button type="submit" className="w-full btn-primary px-8 py-4 rounded-xl font-semibold text-lg mt-4">
              Enter Studio →
            </button>
          </form>
        </div>

        <p className="mt-12 text-sm text-slate-400">
          Free to use • High-fidelity AI music generation <br />
          Built for creators, by Cithara.
        </p>
      </div>
    </div>
  );
}
