const config = {
  app_tagline: "Create music with AI in minutes",
  empty_library_message: "No songs in your library yet",
  background_color: "#f8fafc",
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action: "#6366f1",
  secondary_action: "#64748b"
};

// App State
let currentPage = 'signin';
let currentStep = 1;
let isPlaying = false;
let currentSongIndex = null;
let generationProgress = 0;

// API State
const API_BASE = '/api';
let currentLibraryId = null;

let formData = {
  title: '', occasion: '', genre: '', voice: '', mood: '', story: '', context: ''
};

let library = [];

// Utility function to extract Django CSRF token
function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const genres = ['Rock', 'Pop', 'HipHop', 'Country', 'Jazz'];
const voices = ['Male', 'Female'];
const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];
const occasions = ['Birthday', 'Wedding', 'Funeral', 'Party', 'Relaxation', 'Study', 'Other'];

function navigate(page) {
  currentPage = page;
  if (page === 'library') {
      loadLibraryFromAPI();
  } else {
      render();
  }
}

function nextStep() {
  if (currentStep < 3) { currentStep++; render(); }
}
function prevStep() {
  if (currentStep > 1) { currentStep--; render(); }
}

async function handleSignIn() {
    const usernameInput = document.getElementById('signin_username');
    const emailInput = document.getElementById('signin_email');
    const username = usernameInput ? usernameInput.value : '';
    const email = emailInput ? emailInput.value : '';
    
    if (!username || !email) {
        alert('Please provide a username and email to continue.');
        return;
    }

    let userId = null;
    let userLibId = null;

    // Try to create user
    try {
        const res = await fetch(`${API_BASE}/users/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ username, email })
        });
        if (res.ok) {
            const data = await res.json();
            userId = data.id;
        } else {
            // If user exists, find their ID
            const usersRes = await fetch(`${API_BASE}/users/`);
            const usersData = await usersRes.json();
            const usersList = usersData.results || usersData;
            const existingUser = usersList.find(u => u.username === username);
            if (existingUser) userId = existingUser.id;
        }
    } catch(e) { console.error(e); }

    if (!userId) {
        alert('Failed to connect or create user. Please check credentials or the Django backend.');
        return;
    }

    // Fetch libraries and find one
    try {
        const libRes = await fetch(`${API_BASE}/libraries/`);
        if (libRes.ok) {
            const libData = await libRes.json();
            const libsList = libData.results || libData;
            
            // Try to find library for this user
            const userLib = libsList.find(l => l.user === userId || (l.user && l.user.id === userId));
            
            if (userLib) {
                userLibId = userLib.id;
            } else {
                // Force Create a library via POST
                const createLib = await fetch(`${API_BASE}/libraries/`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify({ user: userId })
                });
                if (createLib.ok) {
                    const newLib = await createLib.json();
                    userLibId = newLib.id;
                }
            }
        }
    } catch (e) { console.error(e); }

    if (userLibId) {
        currentLibraryId = userLibId;
        navigate('library');
    } else {
        alert('Could not set up your library. Please create one manually in Django Admin.');
    }
}

async function loadLibraryFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/songs/`);
        if (response.ok) {
            const data = await response.json();
            const songsList = Array.isArray(data) ? data : (data.results || []);
            library = songsList.map(song => ({
                id: song.id,
                title: song.title,
                genre: song.genre,
                mood: song.mood,
                status: song.status,
                date: new Date(song.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                duration: song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2, '0')}` : '0:00'
            }));
        }
        render();
    } catch(e) { 
        console.error(e); 
        render();
    }
}

async function startGeneration() {
  if (!currentLibraryId) {
      alert('No library associated with your session. Please sign in again.');
      return;
  }
  currentPage = 'generating';
  generationProgress = 0;
  render();
  
  const promptText = [formData.story, formData.context].filter(Boolean).join('. ').substring(0, 1000);

  // Fire API call
  let errorOccurred = false;
  try {
      const res = await fetch(`${API_BASE}/songs/`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken()
          },
          body: JSON.stringify({
              library: currentLibraryId,
              title: formData.title || "Untitled Song",
              genre: formData.genre || "Pop",
              mood: formData.mood || "Happy",
              occasion: formData.occasion || "Other",
              singer_voice: formData.voice || "Male",
              prompt: promptText,
              status: "Queued", 
              audio_format: "MP3"
          })
      });
      
      if (!res.ok) {
          errorOccurred = true;
          const errData = await res.text();
          alert("Generation Failed (Server Error): " + errData);
          currentPage = 'create';
          render();
          return;
      }
  } catch(e) { 
      console.error(e); 
      errorOccurred = true;
      alert("Network Error: Could not connect to Django.");
      currentPage = 'create';
      render();
      return;
  }

  if (errorOccurred) return;

  const interval = setInterval(() => {
    generationProgress += Math.random() * 15;
    if (generationProgress >= 100) {
      generationProgress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadLibraryFromAPI().then(() => {
            currentPage = 'library';
            currentSongIndex = null;
            formData = { title: '', occasion: '', genre: '', voice: '', mood: '', story: '', context: '' };
            currentStep = 1;
            render();
        });
      }, 500);
    }
    render();
  }, 300);
}

function playSong(index) {
  currentSongIndex = index;
  isPlaying = true;
  render();
}

function togglePlay() {
  isPlaying = !isPlaying;
  render();
}

async function deleteSong(index) {
  const songId = library[index].id;
  try {
      await fetch(`${API_BASE}/songs/${songId}/`, { 
          method: 'DELETE',
          headers: { 'X-CSRFToken': getCSRFToken() }
      });
      library.splice(index, 1);
      if (currentSongIndex === index) {
        currentSongIndex = null;
        isPlaying = false;
      } else if (currentSongIndex > index) {
        currentSongIndex--;
      }
      render();
  } catch(e) { console.error(e); }
}

function renderSignIn() {
  return `
    <div class="w-full h-full flex items-center justify-center" style="background: ${config.background_color};">
      <div class="text-center animate-fade-in w-full max-w-md px-6">
        <div class="mb-8">
          <div class="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6" style="background: linear-gradient(135deg, ${config.primary_action} 0%, #8b5cf6 100%);">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="24" r="6" fill="white"/>
              <path d="M30 24H42" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <path d="M6 24H18" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="text-5xl font-bold mb-3" style="color: ${config.text_color};">Cithara</h1>
          <p class="text-xl" style="color: ${config.secondary_action};">${config.app_tagline}</p>
        </div>
        
        <div class="space-y-4 max-w-sm mx-auto p-6 rounded-2xl bg-white shadow-lg">
          <h3 class="text-lg font-semibold text-gray-800 text-left mb-2">Create or Login User</h3>
          <input type="text" id="signin_username" placeholder="Username (e.g. j_doe)" class="w-full px-4 py-3 rounded-xl border border-gray-200" style="background: #fdfdfd; color: ${config.text_color};" required>
          <input type="email" id="signin_email" placeholder="Email (e.g. j@test.com)" class="w-full px-4 py-3 rounded-xl border border-gray-200" style="background: #fdfdfd; color: ${config.text_color};" required>
          <button onclick="handleSignIn()" class="w-full btn-primary px-8 py-4 rounded-xl font-medium text-white transition-all hover:shadow-lg mt-2">
            Continue to App
          </button>
        </div>
        
        <p class="mt-8 text-sm" style="color: ${config.secondary_action};">
          Your generated AI music domain engine.
        </p>
      </div>
    </div>
  `;
}

function renderCreate() {
  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Style & Mood' },
    { num: 3, label: 'Story' }
  ];

  return `
    <div class="w-full h-full flex flex-col" style="background: ${config.background_color};">
      ${renderHeader()}
      <div class="flex-1 overflow-auto">
        <div class="max-w-2xl mx-auto px-6 py-8">
          <div class="flex items-center justify-center gap-2 mb-10">
            ${steps.map((step, i) => `
              <div class="flex items-center">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep >= step.num ? 'text-white' : 'text-slate-400'
                  }" style="${currentStep >= step.num ? `background: ${config.primary_action};` : `background: ${config.surface_color}; border: 2px solid #e2e8f0;`}">
                    ${currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span class="text-sm font-medium hidden sm:block" style="color: ${currentStep >= step.num ? config.text_color : config.secondary_action};">${step.label}</span>
                </div>
                ${i < steps.length - 1 ? `<div class="w-12 h-0.5 mx-3" style="background: ${currentStep > step.num ? config.primary_action : '#e2e8f0'};"></div>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="rounded-3xl p-8 animate-slide-up" style="background: ${config.surface_color}; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            ${currentStep === 1 ? renderStep1() : ''}
            ${currentStep === 2 ? renderStep2() : ''}
            ${currentStep === 3 ? renderStep3() : ''}

            <div class="flex justify-between mt-8 pt-6 border-t border-slate-100">
              ${currentStep > 1 ? `
                <button onclick="prevStep()" class="px-6 py-3 rounded-xl font-medium transition-all hover:bg-slate-100" style="color: ${config.secondary_action};">← Back</button>
              ` : '<div></div>'}
              
              ${currentStep < 3 ? `
                <button onclick="nextStep()" class="btn-primary px-8 py-3 rounded-xl font-medium text-white">Next →</button>
              ` : `
                <button onclick="navigate('review')" class="btn-primary px-8 py-3 rounded-xl font-medium text-white">Review Song →</button>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStep1() {
  return `
    <h2 class="text-2xl font-semibold mb-6" style="color: ${config.text_color};">Tell us about your song</h2>
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Song Title</label>
        <input type="text" value="${formData.title}" oninput="formData.title = this.value" placeholder="e.g., Summer Memories" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base" style="background: ${config.background_color}; color: ${config.text_color};">
      </div>
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Occasion</label>
        <select onchange="formData.occasion = this.value" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer" style="background: ${config.background_color}; color: ${config.text_color};">
          <option value="">Select an occasion</option>
          ${occasions.map(o => `<option value="${o}" ${formData.occasion === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderStep2() {
  return `
    <h2 class="text-2xl font-semibold mb-6" style="color: ${config.text_color};">Choose your style</h2>
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Genre</label>
        <select onchange="formData.genre = this.value" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer" style="background: ${config.background_color}; color: ${config.text_color};">
          <option value="">Select a genre</option>
          ${genres.map(g => `<option value="${g}" ${formData.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Singer Voice</label>
        <select onchange="formData.voice = this.value" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer" style="background: ${config.background_color}; color: ${config.text_color};">
          <option value="">Select voice type</option>
          ${voices.map(v => `<option value="${v}" ${formData.voice === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Mood</label>
        <select onchange="formData.mood = this.value" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base appearance-none cursor-pointer" style="background: ${config.background_color}; color: ${config.text_color};">
          <option value="">Select a mood</option>
          ${moods.map(m => `<option value="${m}" ${formData.mood === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderStep3() {
  return `
    <h2 class="text-2xl font-semibold mb-6" style="color: ${config.text_color};">Add your story</h2>
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Custom Story <span class="font-normal" style="color: ${config.secondary_action};">(optional)</span></label>
        <textarea oninput="formData.story = this.value" rows="4" placeholder="Share the story behind your song. What memories, feelings, or moments should it capture?" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base resize-none" style="background: ${config.background_color}; color: ${config.text_color};">${formData.story}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2" style="color: ${config.text_color};">Additional Context <span class="font-normal" style="color: ${config.secondary_action};">(optional)</span></label>
        <textarea oninput="formData.context = this.value" rows="3" maxlength="1000" placeholder="Any specific lyrics, themes, or musical elements you'd like included..." class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base resize-none" style="background: ${config.background_color}; color: ${config.text_color};">${formData.context}</textarea>
        <p class="text-xs mt-1" style="color: ${config.secondary_action};">${formData.context.length}/1000 characters</p>
      </div>
    </div>
  `;
}

function renderReview() {
  const details = [
    { label: 'Song Title', value: formData.title || '—' },
    { label: 'Occasion', value: formData.occasion || '—' },
    { label: 'Genre', value: formData.genre || '—' },
    { label: 'Voice', value: formData.voice || '—' },
    { label: 'Mood', value: formData.mood || '—' },
    { label: 'Story', value: formData.story || '—' },
    { label: 'Additional Context', value: formData.context || '—' }
  ];

  return `
    <div class="w-full h-full flex flex-col" style="background: ${config.background_color};">
      ${renderHeader()}
      <div class="flex-1 overflow-auto">
        <div class="max-w-2xl mx-auto px-6 py-8">
          <div class="text-center mb-8 animate-fade-in">
            <h2 class="text-3xl font-bold mb-2" style="color: ${config.text_color};">Review Your Song</h2>
            <p style="color: ${config.secondary_action};">Make sure everything looks good before generating</p>
          </div>

          <div class="rounded-3xl p-8 animate-slide-up" style="background: ${config.surface_color}; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div class="space-y-4">
              ${details.map(d => `
                <div class="flex justify-between py-3 border-b border-slate-100 last:border-0">
                  <span class="font-medium" style="color: ${config.secondary_action};">${d.label}</span>
                  <span class="text-right max-w-xs truncate" style="color: ${config.text_color};">${d.value}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex gap-4 mt-8 pt-6 border-t border-slate-100">
              <button onclick="currentStep = 1; navigate('create')" class="flex-1 px-6 py-3 rounded-xl font-medium border-2 transition-all hover:bg-slate-50" style="border-color: ${config.primary_action}; color: ${config.primary_action};">Edit Details</button>
              <button onclick="startGeneration()" class="flex-1 btn-primary px-6 py-3 rounded-xl font-medium text-white">✨ Generate Song</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGenerating() {
  const messages = [
    { progress: 0, text: "Submitting to Django backend..." },
    { progress: 20, text: "Composing melodies..." },
    { progress: 40, text: "Arranging instruments..." },
    { progress: 60, text: "Persisting to database..." },
    { progress: 80, text: "Mixing and mastering..." },
    { progress: 95, text: "Final touches..." }
  ];

  const currentMessage = [...messages].reverse().find(m => generationProgress >= m.progress)?.text || messages[0].text;

  return `
    <div class="w-full h-full flex flex-col" style="background: ${config.background_color};">
      ${renderHeader()}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center max-w-md mx-auto px-6 animate-fade-in">
          <div class="flex items-end justify-center gap-1 h-16 mb-8">
            ${[1,2,3,4,5].map(() => `<div class="w-3 rounded-full wave-bar" style="background: ${config.primary_action};"></div>`).join('')}
          </div>
          <h2 class="text-2xl font-bold mb-2" style="color: ${config.text_color};">Creating Your Song</h2>
          <p class="mb-8" style="color: ${config.secondary_action};">${currentMessage}</p>
          <div class="w-full h-3 rounded-full overflow-hidden mb-4" style="background: #e2e8f0;">
            <div class="h-full rounded-full progress-fill" style="width: ${generationProgress}%; background: linear-gradient(90deg, ${config.primary_action}, #8b5cf6);"></div>
          </div>
          <p class="mono text-sm font-semibold" style="color: ${config.primary_action};">${Math.round(generationProgress)}%</p>
        </div>
      </div>
    </div>
  `;
}

function renderLibrary() {
  return `
    <div class="w-full h-full flex flex-col" style="background: ${config.background_color};">
      ${renderHeader()}
      <div class="flex-1 overflow-auto">
        <div class="max-w-4xl mx-auto px-6 py-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-bold" style="color: ${config.text_color};">Your Library</h2>
              <p style="color: ${config.secondary_action};">${library.length} song${library.length !== 1 ? 's' : ''}</p>
            </div>
            <button onclick="navigate('create')" class="btn-primary px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10h12"/></svg>
              Create New
            </button>
          </div>

          ${library.length === 0 ? `
            <div class="text-center py-20 animate-fade-in">
              <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style="background: #f1f5f9;">
                <svg width="32" height="32" fill="none" stroke="${config.secondary_action}" stroke-width="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p class="text-lg" style="color: ${config.secondary_action};">${config.empty_library_message}</p>
              <button onclick="navigate('create')" class="mt-4 text-sm font-medium" style="color: ${config.primary_action};">Create your first song →</button>
            </div>
          ` : `
            <div class="space-y-4">
              ${library.map((song, i) => `
                <div class="rounded-2xl p-5 card-hover cursor-pointer animate-slide-up ${currentSongIndex === i ? 'ring-2' : ''}" 
                  style="background: ${config.surface_color}; animation-delay: ${i * 0.05}s; ${currentSongIndex === i ? `ring-color: ${config.primary_action};` : ''}"
                  onclick="playSong(${i})">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, ${config.primary_action}20, #8b5cf620);">
                      ${currentSongIndex === i && isPlaying ? `
                        <div class="flex items-end gap-0.5 h-6">
                          ${[1,2,3].map(() => `<div class="w-1 rounded-full wave-bar" style="background: ${config.primary_action};"></div>`).join('')}
                        </div>
                      ` : `<svg width="24" height="24" fill="${config.primary_action}"><path d="M8 5v14l11-7z"/></svg>`}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold truncate" style="color: ${config.text_color};">${song.title}</h3>
                      <p class="text-sm" style="color: ${config.secondary_action};">${song.genre} • ${song.mood} • ${song.status}</p>
                    </div>
                    
                    <div class="text-right">
                      <p class="mono text-sm" style="color: ${config.text_color};">${song.duration}</p>
                      <p class="text-xs" style="color: ${config.secondary_action};">${song.date}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      ${currentSongIndex !== null ? renderPlayer() : ''}
    </div>
  `;
}

function renderPlayer() {
  const song = library[currentSongIndex];
  if (!song) return '';

  return `
    <div class="border-t p-4" style="background: ${config.surface_color}; border-color: #e2e8f0;">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, ${config.primary_action}, #8b5cf6);">
              <svg width="20" height="20" fill="white"><path d="M4 3v14l5-3v-8l5-3v14"/></svg>
            </div>
            <div class="min-w-0">
              <h4 class="font-semibold truncate" style="color: ${config.text_color};">${song.title}</h4>
              <p class="text-sm truncate" style="color: ${config.secondary_action};">${song.genre} • ${song.mood}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="togglePlay()" class="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105" style="background: ${config.primary_action};">
              ${isPlaying ? `<svg width="20" height="20" fill="white"><rect x="6" y="4" width="3" height="12"/><rect x="11" y="4" width="3" height="12"/></svg>` 
                          : `<svg width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>`}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button class="p-2 rounded-lg transition-all hover:bg-slate-100" title="Share via DRF URL">
              <svg width="20" height="20" fill="none" stroke="${config.secondary_action}" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <button onclick="event.stopPropagation(); deleteSong(${currentSongIndex})" class="p-2 rounded-lg transition-all hover:bg-red-50" title="Delete from Database">
              <svg width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-3">
          <span class="mono text-xs" style="color: ${config.secondary_action};">0:00</span>
          <div class="flex-1 h-1.5 rounded-full cursor-pointer" style="background: #e2e8f0;">
            <div class="h-full rounded-full" style="width: 0%; background: ${config.primary_action};"></div>
          </div>
          <span class="mono text-xs" style="color: ${config.secondary_action};">${song.duration}</span>
        </div>
      </div>
    </div>
  `;
}

function renderHeader() {
  return `
    <header class="px-6 py-4 border-b flex items-center justify-between" style="background: ${config.surface_color}; border-color: #e2e8f0;">
      <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('signin')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, ${config.primary_action}, #8b5cf6);">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C24 4 36 8 36 24C36 40 24 44 24 44" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <path d="M24 4C24 4 12 8 12 24C12 40 24 44 24 44" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <circle cx="24" cy="24" r="4" fill="white"/>
          </svg>
        </div>
        <span class="text-xl font-bold" style="color: ${config.text_color};">Cithara (Django Layer)</span>
      </div>
      <nav class="flex items-center gap-6">
        <button onclick="navigate('create')" class="text-sm font-medium transition-all hover:opacity-70" style="color: ${currentPage === 'create' || currentPage === 'review' ? config.primary_action : config.secondary_action};">Create</button>
        <button onclick="navigate('library')" class="text-sm font-medium transition-all hover:opacity-70" style="color: ${currentPage === 'library' ? config.primary_action : config.secondary_action};">Library</button>
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white" style="background: ${config.secondary_action}; title="User Session"">U</div>
      </nav>
    </header>
  `;
}

function render() {
  const app = document.getElementById('app');
  document.body.style.background = config.background_color;
  switch (currentPage) {
    case 'signin': app.innerHTML = renderSignIn(); break;
    case 'create': app.innerHTML = renderCreate(); break;
    case 'review': app.innerHTML = renderReview(); break;
    case 'generating': app.innerHTML = renderGenerating(); break;
    case 'library': app.innerHTML = renderLibrary(); break;
    default: app.innerHTML = renderSignIn();
  }
}

// Initialize
window.addEventListener('load', () => { render(); });
