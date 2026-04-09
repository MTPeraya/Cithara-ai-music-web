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
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-500 to-purple-500">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="24" r="6" fill="white" />
              <path d="M30 24H42" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M6 24H18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-3 text-slate-800">Cithara</h1>
          <p className="text-xl text-slate-500">Create music with AI in minutes</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 max-w-sm mx-auto p-6 rounded-2xl bg-white shadow-lg text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Create or Login User</h3>
          <input name="username" type="text" placeholder="Username (e.g. j_doe)" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" required />
          <input name="email" type="email" placeholder="Email (e.g. j@test.com)" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" required />
          <button type="submit" className="w-full btn-primary px-8 py-4 rounded-xl font-medium text-white mt-2">
            Continue to App
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-500">
          Free to use • No credit card required <br />
          Your generated AI music domain engine.
        </p>
      </div>
    </div>
  );
}
