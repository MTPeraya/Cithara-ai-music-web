import { useState, useEffect } from 'react';
import { api } from '../api';

const genres = ['Rock', 'Pop', 'HipHop', 'Country', 'Jazz'];
const voices = ['Male', 'Female'];
const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];
const occasions = ['Birthday', 'Wedding', 'Funeral', 'Party', 'Relaxation', 'Workout', 'Study', 'Other'];

// Which fields are required per step
const REQUIRED_FIELDS = {
  1: ['title', 'occasion'],
  2: ['genre', 'voice', 'mood'],
};

// Map real Suno/backend statuses to user-friendly labels + progress %
const STATUS_MAP = {
  queued: { message: 'Queued — waiting for Suno AI...', progress: 10 },
  generating: { message: 'Suno AI is composing your song...', progress: 55 },
  completed: { message: 'Your song is ready!', progress: 100 },
  failed: { message: 'Generation failed.', progress: 0 },
};

function FieldError({ show, message }) {
  if (!show) return null;
  return (
    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
      </svg>
      {message}
    </p>
  );
}

export default function CreateFlow({ currentPage, setCurrentPage, currentLibraryId, editingSong, onGenerationComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', occasion: '', genre: '', voice: '', mood: '', story: '', context: '' });
  
  // Initialize form with editingSong data if available (GEN-3)
  useEffect(() => {
    if (editingSong) {
      setFormData({
        title: editingSong.title || '',
        occasion: editingSong.occasion || '',
        genre: editingSong.genre || '',
        voice: editingSong.singer_voice || '',
        mood: editingSong.mood || '',
        story: '', // Reset story as it's typically fresh
        context: editingSong.prompt || ''
      });
    }
  }, [editingSong]);

  // Tracks which steps the user has attempted to submit (so we show errors for those steps)
  const [attemptedSteps, setAttemptedSteps] = useState({});
  const [generationStatus, setGenerationStatus] = useState('queued');
  const [generationMessage, setGenerationMessage] = useState('');

  useEffect(() => {
    if (currentPage === 'review') setStep(4);
  }, [currentPage]);

  // Dedicated effect for the generation lifecycle
  useEffect(() => {
    if (currentPage !== 'generating') return;

    setGenerationStatus('queued');
    setGenerationMessage(STATUS_MAP.queued.message);

    if (!currentLibraryId) {
      alert('No library found. Please sign in again.');
      setCurrentPage('create');
      return;
    }

    let interval; // keep reference so we can clear it

    const run = async () => {
      try {
        let song;
        if (editingSong) {
          // Update existing song with new parameters (GEN-3)
          await api.updateSong(editingSong.id, formData);
          // Trigger regeneration
          song = await api.regenerateSong(editingSong.id);
        } else {
          // Create new song
          song = await api.createSong(currentLibraryId, formData);
        }

        const doPoll = async () => {
          try {
            const data = await api.checkStatus(song.id || editingSong?.id);
            const rawStatus = (data.song?.status || 'queued').toLowerCase();
            const mapped = STATUS_MAP[rawStatus] || { message: 'Processing...', progress: 30 };

            setGenerationStatus(rawStatus);
            setGenerationMessage(mapped.message);

            if (rawStatus === 'completed') {
              clearInterval(interval);
              setTimeout(() => onGenerationComplete(), 800);
            } else if (rawStatus === 'failed') {
              clearInterval(interval);
              setTimeout(() => {
                alert('Song generation failed. Please try again.');
                setCurrentPage('create');
              }, 500);
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        };

        // Poll immediately for mock/instant strategies
        doPoll();
        interval = setInterval(doPoll, 5000);
      } catch (e) {
        alert(e.message);
        setCurrentPage('create');
      }
    };

    run();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPage, currentLibraryId, formData, onGenerationComplete]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (s) => {
    const fields = REQUIRED_FIELDS[s] || [];
    return fields.every(f => !!formData[f]);
  };

  // A field shows as invalid when: the step has been attempted AND the field is empty
  const isFieldInvalid = (stepNum, name) => !!attemptedSteps[stepNum] && !formData[name];

  const nextStep = () => {
    // Mark this step as attempted so errors become visible
    setAttemptedSteps(prev => ({ ...prev, [step]: true }));
    if (!validateStep(step)) return; // Block advancement
    if (step < 3) setStep(step + 1);
    else setCurrentPage('review');
  };

  const handleGenerate = () => {
    setAttemptedSteps({ 1: true, 2: true });
    if (!validateStep(1)) { setStep(1); return; }
    if (!validateStep(2)) { setStep(2); return; }

    // Only now navigate to generating
    setCurrentPage('generating');
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Basic Info' },
      { num: 2, label: 'Style & Mood' },
      { num: 3, label: 'Story' },
    ];
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

  // ────────────────────────────────────────────────
  // GENERATING SCREEN — live Suno status
  // ────────────────────────────────────────────────
  if (currentPage === 'generating') {
    const progress = STATUS_MAP[generationStatus]?.progress ?? 30;
    const isWaiting = generationStatus !== 'completed';

    return (
      <div className="flex-1 flex items-center justify-center h-full bg-slate-50/50 min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-6 animate-fade-in">
          {/* Animated waveform */}
          <div className="flex items-end justify-center gap-1.5 h-16 mb-10">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`w-3 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500 shadow-sm shadow-indigo-100 ${isWaiting ? 'wave-bar' : ''}`} style={{ height: '40px' }}></div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">
            {generationStatus === 'completed' ? '🎉 Song Ready!' : 'Creating Your Song'}
          </h2>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold my-4 border
            ${generationStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              generationStatus === 'failed'    ? 'bg-red-50 text-red-600 border-red-200' :
                                                 'bg-indigo-50 text-indigo-600 border-indigo-100'}">
            {generationStatus === 'generating' && (
              <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {generationStatus.charAt(0).toUpperCase() + generationStatus.slice(1)}
          </div>

          <p className="mb-8 text-slate-500 font-medium">{generationMessage}</p>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden mb-4 bg-slate-200 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mono text-sm font-bold text-indigo-600 tracking-wider">{progress}%</p>

          {generationStatus === 'queued' && (
            <p className="text-xs text-slate-400 mt-4">Suno AI may take 1–3 minutes. Please keep this page open.</p>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // REVIEW SCREEN
  // ────────────────────────────────────────────────
  if (currentPage === 'review') {
    const details = [
      { label: 'Song Title', value: formData.title || '—' },
      { label: 'Occasion', value: formData.occasion || '—' },
      { label: 'Genre', value: formData.genre || '—' },
      { label: 'Voice', value: formData.voice || '—' },
      { label: 'Mood', value: formData.mood || '—' },
      { label: 'Story', value: formData.story || '(none)' },
      { label: 'Additional Context', value: formData.context || '(none)' },
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
            <button onClick={() => { setStep(1); setCurrentPage('create'); }} className="flex-1 px-6 py-3 rounded-xl font-medium border-2 border-indigo-500 text-indigo-500 transition-all hover:bg-slate-50">
              Edit Details
            </button>
            <button onClick={handleGenerate} className="flex-1 btn-primary px-6 py-3 rounded-xl font-medium text-white">
              ✨ Generate Song
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // CREATE FORM (Steps 1-3)
  // ────────────────────────────────────────────────
  const inputBase = 'w-full px-4 py-3 rounded-xl text-base bg-white text-slate-800 focus:outline-none focus:ring-2 transition-all';
  const inputNormal = `${inputBase} border border-slate-200 focus:ring-indigo-500 focus:border-indigo-500`;
  const inputError = `${inputBase} border-2 border-red-400 focus:ring-red-300 focus:border-red-400 bg-red-50/30`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {renderStepIndicator()}
      <div className="rounded-3xl p-8 animate-slide-up bg-white shadow-sm">

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Tell us about your song</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Song Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Memories"
                  className={isFieldInvalid(1, 'title') ? inputError : inputNormal}
                />
                <FieldError show={isFieldInvalid(1, 'title')} message="Song title is required." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Occasion <span className="text-red-400">*</span>
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className={`appearance-none cursor-pointer ${isFieldInvalid(1, 'occasion') ? inputError : inputNormal}`}
                >
                  <option value="">Select an occasion</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <FieldError show={isFieldInvalid(1, 'occasion')} message="Please select an occasion." />
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Style & Mood ── */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Choose your style</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Genre <span className="text-red-400">*</span>
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={`appearance-none cursor-pointer ${isFieldInvalid(2, 'genre') ? inputError : inputNormal}`}
                >
                  <option value="">Select a genre</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <FieldError show={isFieldInvalid(2, 'genre')} message="Please select a genre." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Singer Voice <span className="text-red-400">*</span>
                </label>
                <select
                  name="voice"
                  value={formData.voice}
                  onChange={handleChange}
                  className={`appearance-none cursor-pointer ${isFieldInvalid(2, 'voice') ? inputError : inputNormal}`}
                >
                  <option value="">Select voice type</option>
                  {voices.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <FieldError show={isFieldInvalid(2, 'voice')} message="Please select a singer voice." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Mood <span className="text-red-400">*</span>
                </label>
                <select
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  className={`appearance-none cursor-pointer ${isFieldInvalid(2, 'mood') ? inputError : inputNormal}`}
                >
                  <option value="">Select a mood</option>
                  {moods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <FieldError show={isFieldInvalid(2, 'mood')} message="Please select a mood." />
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Story (Optional) ── */}
        {step === 3 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-800">Add your story</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-full">Optional Step</span>
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Sharing a story helps the AI create something truly personal.{' '}
              <strong>You can skip this step</strong> by clicking 'Review Song →' below.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Custom Story</label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Share the story behind your song..."
                  className={inputNormal + ' resize-none'}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Additional Context</label>
                <textarea
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  rows="3"
                  maxLength="1000"
                  placeholder="Specific lyrics, themes, or musical elements..."
                  className={inputNormal + ' resize-none'}
                ></textarea>
                <p className="text-xs mt-1 text-slate-500">{formData.context.length}/1000 characters</p>
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
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
