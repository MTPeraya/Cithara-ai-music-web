import { useState, useEffect } from 'react';
import { api } from '../api';

const genres = ['Rock', 'Pop', 'HipHop', 'Country', 'Jazz'];
const voices = ['Male', 'Female'];
const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];
const occasions = ['Birthday', 'Wedding', 'Funeral', 'Party', 'Relaxation', 'Study', 'Other'];

export default function CreateFlow({ currentPage, setCurrentPage, currentLibraryId, onGenerationComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', occasion: '', genre: '', voice: '', mood: '', story: '', context: '' });
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    if (currentPage === 'review') setStep(4);
    if (currentPage === 'generating') {
      startGeneration();
    }
  }, [currentPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startGeneration = async () => {
    if (!currentLibraryId) {
      alert('No library found. Please sign in again.');
      return;
    }
    setGenerationProgress(0);
    
    try {
      const song = await api.createSong(currentLibraryId, formData);
      pollProgress(song.id);
    } catch (e) {
      alert(e.message);
      setCurrentPage('create');
    }
  };

  const pollProgress = (songId) => {
    let progress = 0;
    const interval = setInterval(async () => {
      try {
        const data = await api.checkStatus(songId);
        const songStatus = data.song.status;

        // Visual progress increment (keep it moving for UX)
        progress = Math.min(progress + (Math.random() * 5), 98);
        setGenerationProgress(progress);

        if (songStatus === 'completed') {
          setGenerationProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            onGenerationComplete();
          }, 800);
        } else if (songStatus === 'failed') {
          clearInterval(interval);
          alert('Song generation failed. Please try again.');
          setCurrentPage('create');
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 5000); // Poll every 5 seconds for Suno
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else setCurrentPage('review');
  };

  const renderStepIndicator = () => {
    const steps = [ { num: 1, label: 'Basic Info' }, { num: 2, label: 'Style & Mood' }, { num: 3, label: 'Story' } ];
    return (
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= s.num ? 'text-white btn-primary' : 'text-slate-400 bg-white border-2 border-slate-100'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-3 rounded-full ${step > s.num ? 'bg-indigo-500' : 'bg-slate-100'}`}></div>}
          </div>
        ))}
      </div>
    );
  };

  if (currentPage === 'generating') {
    const messages = [ "Analyzing your story...", "Composing melodies...", "Arranging instruments...", "Adding vocals...", "Mixing and mastering...", "Final touches..." ];
    const currentMessage = messages[Math.min(Math.floor(generationProgress / 16.6), 5)];

    return (
      <div className="flex-1 flex items-center justify-center h-full bg-slate-50/50">
        <div className="text-center max-w-md mx-auto px-6 animate-fade-in">
          <div className="flex items-end justify-center gap-1.5 h-16 mb-10">
            {[1,2,3,4,5].map(n => <div key={n} className="w-3 rounded-full wave-bar bg-gradient-to-t from-indigo-500 to-purple-500 shadow-sm shadow-indigo-100"></div>)}
          </div>
          <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">Creating Your Song</h2>
          <p className="mb-10 text-slate-500 font-medium">{currentMessage}</p>
          <div className="w-full h-3 rounded-full overflow-hidden mb-4 bg-slate-200 shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite] transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
          </div>
          <p className="mono text-sm font-bold text-indigo-600 tracking-wider transition-all">{Math.round(generationProgress)}%</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'review') {
    const details = [
      { label: 'Song Title', value: formData.title || '—' },
      { label: 'Occasion', value: formData.occasion || '—' },
      { label: 'Genre', value: formData.genre || '—' },
      { label: 'Voice', value: formData.voice || '—' },
      { label: 'Mood', value: formData.mood || '—' },
      { label: 'Story', value: formData.story || '—' },
      { label: 'Additional Context', value: formData.context || '—' }
    ];

    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2 text-slate-800">Review Your Song</h2>
          <p className="text-slate-500">Make sure everything looks good before generating</p>
        </div>
        <div className="rounded-3xl p-8 animate-slide-up bg-white shadow-sm">
          <div className="space-y-4">
            {details.map((d, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-500">{d.label}</span>
                <span className="text-right max-w-xs truncate text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => { setStep(1); setCurrentPage('create'); }} className="flex-1 px-6 py-3 rounded-xl font-medium border-2 border-indigo-500 text-indigo-500 transition-all hover:bg-slate-50">Edit Details</button>
            <button onClick={() => setCurrentPage('generating')} className="flex-1 btn-primary px-6 py-3 rounded-xl font-medium text-white">✨ Generate Song</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {renderStepIndicator()}
      <div className="rounded-3xl p-8 animate-slide-up bg-white shadow-sm">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Tell us about your song</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Song Title</label>
                <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g., Summer Memories" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Occasion</label>
                <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select an occasion</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Choose your style</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Genre</label>
                <select name="genre" value={formData.genre} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select a genre</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Singer Voice</label>
                <select name="voice" value={formData.voice} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select voice type</option>
                  {voices.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Mood</label>
                <select name="mood" value={formData.mood} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select a mood</option>
                  {moods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Add your story</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Custom Story <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea name="story" value={formData.story} onChange={handleChange} rows="4" placeholder="Share the story behind your song. What memories, feelings, or moments should it capture?" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base resize-none bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Additional Context <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea name="context" value={formData.context} onChange={handleChange} rows="3" maxLength="1000" placeholder="Any specific lyrics, themes, or musical elements you'd like included..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base resize-none bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                <p className="text-xs mt-1 text-slate-500">{formData.context.length}/1000 characters</p>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-medium transition-all hover:bg-slate-100 text-slate-500">← Back</button>
          ) : <div></div>}
          
          <button onClick={nextStep} className="btn-primary px-8 py-3 rounded-xl font-medium text-white">
            {step < 3 ? 'Next →' : 'Review Song →'}
          </button>
        </div>
      </div>
    </div>
  );
}
