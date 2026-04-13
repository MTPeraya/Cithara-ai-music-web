// API interaction logic using fetch

const API_BASE = 'http://localhost:8000/api'; // Assuming Django is running on 8000 (Check the docker-compose.yml file)

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

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  return headers;
}

export const api = {
  createOrGetUser: async (username, email) => {
    let userId = null;
    try {
      const res = await fetch(`${API_BASE}/users/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, email })
      });
      if (res.ok) {
        const data = await res.json();
        userId = data.id;
      } else {
        const usersRes = await fetch(`${API_BASE}/users/`);
        const usersData = await usersRes.json();
        const usersList = usersData.results || usersData;
        const existingUser = usersList.find(u => u.username === username);
        if (existingUser) userId = existingUser.id;
      }
    } catch(e) { console.error(e); }
    return userId;
  },

  getOrCreateLibrary: async (userId) => {
    try {
      const libRes = await fetch(`${API_BASE}/libraries/`);
      if (libRes.ok) {
        const libData = await libRes.json();
        const libsList = libData.results || libData;
        const userLib = libsList.find(l => l.user === userId || (l.user && l.user.id === userId));
        
        if (userLib) return userLib.id;
        
        const createLib = await fetch(`${API_BASE}/libraries/`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ user: userId })
        });
        if (createLib.ok) {
          const newLib = await createLib.json();
          return newLib.id;
        }
      }
    } catch (e) { console.error(e); }
    return null;
  },

  getSongs: async () => {
    const response = await fetch(`${API_BASE}/songs/`);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : (data.results || []);
    }
    return [];
  },

  createSong: async (libraryId, songData) => {
    const promptText = [songData.story, songData.context].filter(Boolean).join('. ').substring(0, 1000);
    const res = await fetch(`${API_BASE}/songs/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        library: libraryId,
        title: songData.title || "Untitled Song",
        genre: songData.genre || "Pop",
        mood: songData.mood || "Happy",
        occasion: songData.occasion || "Other",
        singer_voice: songData.voice || "Male",
        prompt: promptText,
        status: "Queued",
        audio_format: "MP3"
      })
    });
    if (!res.ok) {
      const errData = await res.text();
      throw new Error("Generation Failed: " + errData);
    }
    return await res.json();
  },

  checkStatus: async (songId) => {
    const res = await fetch(`${API_BASE}/songs/${songId}/check_status/`);
    if (!res.ok) throw new Error("Failed to check status");
    return await res.json();
  },

  deleteSong: async (songId) => {
    const res = await fetch(`${API_BASE}/songs/${songId}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete song");
  }
};
