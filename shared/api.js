/**
 * api.js — Eave Health frontend API layer
 *
 * Handles JWT auth, token storage, and every fetch call to the backend.
 * Include on every page BEFORE page-specific scripts:
 *   <script src="../shared/api.js"></script>
 *
 * Usage:
 *   await EaveAPI.login(email, password)        → stores token, returns user
 *   await EaveAPI.signup({...})                  → stores token, returns user
 *   await EaveAPI.get('/patient/dashboard')      → authed GET
 *   await EaveAPI.post('/patient/vitals', data)  → authed POST
 *   EaveAPI.logout()                             → clears token, redirects
 *   EaveAPI.requireAuth()                        → redirects to login if no token
 *   EaveAPI.getUser()                            → returns stored user object
 */

window.EaveAPI = (function () {

  // ── Environment-aware navigation ─────────────────────────────────────────
  const LOCAL_MAP = {
    '/login':           '/auth/login.html',
    '/signup':          '/auth/signup.html',
    '/dashboard':       '/user/dashboard.html',
    '/chat':            '/user/chat.html',
    '/visits':          '/user/visits.html',
    '/recommendations': '/user/recommendations.html',
    '/metrics':         '/user/metrics.html',
    '/diets':           '/user/diets.html',
    '/home':            '/user/home.html',
    '/provider':        '/institution/provider-lookup.html',
    '/provider-record': '/institution/provider-record.html',
    '/nurse-vitals':    '/institution/nurse-vitals.html',
  };

  function navigate(route) {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    window.location.href = isLocal ? (LOCAL_MAP[route] || route) : route;
  }


  // ── Config ──────────────────────────────────────────────────────────
  // Change this to your deployed backend URL in production
  const BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://your-backend.onrender.com'   // ← your deployed backend URL
  : 'http://localhost:8000';
  
  const TOKEN_KEY  = 'eave_token';
  const USER_KEY   = 'eave_user';


  // ── Token helpers ───────────────────────────────────────────────────

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  function getRole() {
    const u = getUser();
    return u ? u.role : null;
  }


  // ── Auth guards ─────────────────────────────────────────────────────

  function requireAuth(allowedRole) {
    const token = getToken();
    const user  = getUser();
    if (!token || !user) {
      navigate('/login');
      return false;
    }
    if (allowedRole && user.role !== allowedRole) {
      navigate('/login');
      return false;
    }
    return true;
  }

  function logout() {
    clearToken();
    navigate('/login');
  }


  // ── Core fetch wrapper ──────────────────────────────────────────────

  async function _fetch(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = { method, headers };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    const url = path.startsWith('http') ? path : `${BASE}${path}`;
    const res = await fetch(url, opts);

    if (res.status === 401) {
      // Token expired or invalid — force re-login
      clearToken();
      navigate('/login');
      throw new Error('Session expired');
    }

    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || data.message || `Error ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async function get(path)        { return _fetch('GET', path); }
  async function post(path, body) { return _fetch('POST', path, body); }
  async function patch(path, body){ return _fetch('PATCH', path, body); }
  async function del(path)        { return _fetch('DELETE', path); }


  // ── Auth endpoints ──────────────────────────────────────────────────

  async function login(email, password, role) {
    const endpoint = role === 'provider'
      ? '/api/auth/medic/login'
      : '/api/auth/login';

    const data = await post(endpoint, { email, password });
    setToken(data.token);
    setUser({
      user_id: data.user_id,
      full_name: data.full_name,
      patient_code: data.patient_code || null,
      role: data.role,
    });
    return data;
  }

  async function signup(payload, role) {
    const endpoint = role === 'provider'
      ? '/api/auth/medic/signup'
      : '/api/auth/signup';

    const data = await post(endpoint, payload);
    setToken(data.token);
    setUser({
      user_id: data.user_id,
      full_name: data.full_name,
      patient_code: data.patient_code || null,
      role: data.role,
    });
    return data;
  }


  // ── Convenience shortcuts ───────────────────────────────────────────

  // Patient
  async function getDashboard()     { return get('/api/patient/dashboard'); }
  async function getProfile()       { return get('/api/patient/profile'); }
  async function getVitals(n)       { return get(`/api/patient/vitals?limit=${n||20}`); }
  async function getLabs(n)         { return get(`/api/patient/labs?limit=${n||20}`); }
  async function getConditions()    { return get('/api/patient/conditions'); }
  async function getMedications()   { return get('/api/patient/medications'); }
  async function getAppointments(s) { return get(`/api/patient/appointments${s ? '?status='+s : ''}`); }
  async function getHealthScores()  { return get('/api/patient/health-scores'); }
  async function getPredictions()   { return get('/api/patient/predictions'); }
  async function getVisits()        { return get('/api/patient/visits'); }
  async function getTests()         { return get('/api/patient/tests'); }
  async function getLifestyle()     { return get('/api/patient/lifestyle'); }
  async function getFamilyHistory() { return get('/api/patient/family-history'); }

  async function addVitals(d)       { return post('/api/patient/vitals', d); }
  async function addLab(d)          { return post('/api/patient/labs', d); }
  async function addCondition(d)    { return post('/api/patient/conditions', d); }
  async function addMedication(d)   { return post('/api/patient/medications', d); }
  async function addLifestyle(d)    { return post('/api/patient/lifestyle', d); }

  // Medic / Provider
  async function lookupPatient(code){ return get(`/api/medic/lookup/${code}`); }
  async function recordVitals(d)    { return post('/api/medic/vitals', d); }
  async function logVisit(d)        { return post('/api/medic/visit', d); }
  async function scheduleAppt(d)    { return post('/api/medic/appointment', d); }
  async function runPrediction(code){ return post(`/api/medic/predict/${code}`); }
  async function runHealthScore(c)  { return post(`/api/medic/health-score/${c}`); }


  // ── Public API ──────────────────────────────────────────────────────

  return {
    // Config
    BASE,

    // Auth
    login, signup, logout,
    requireAuth, getToken, getUser, getRole, navigate,

    // Generic
    get, post, patch, del,

    // Patient shortcuts
    getDashboard, getProfile, getVitals, getLabs,
    getConditions, getMedications, getAppointments,
    getHealthScores, getPredictions, getVisits,
    getTests, getLifestyle, getFamilyHistory,
    addVitals, addLab, addCondition, addMedication, addLifestyle,

    // Medic shortcuts
    lookupPatient, recordVitals, logVisit,
    scheduleAppt, runPrediction, runHealthScore,
  };

})();
