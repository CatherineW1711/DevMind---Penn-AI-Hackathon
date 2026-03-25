import React, { useState, useEffect, useCallback } from "react";
import DiagnosisPanel from "./components/DiagnosisPanel";
import RefactorPanel from "./components/RefactorPanel";
import TeamSidebar from "./components/TeamSidebar";
import AuditLog from "./components/AuditLog";

const API_BASE = "https://devmind-penn-ai-hackathon.onrender.com";

const ENGINEER_CODE = {
  "Alice Chen": {
    js: {
      filename: "pipeline/transform.js",
      code: `// pipeline/transform.js  — Alice Chen
var API_TIMEOUT = 5000
var MAX_RETRIES = 3

function processUserData(data, opts) {
  var output = []
  var errors = []

  for (var i = 0; i < data.length; i++) {
    var user = data[i]
    if (user == null || user == undefined) {
      continue
    }
    if (user.status != 'active') {
      errors.push(user)
      continue
    }
    var transformed = transformUser(user, opts)
    if (transformed != null) {
      output.push(transformed)
    }
  }

  return { output: output, errors: errors }
}

function transformUser(user, opts) {
  var result = {}
  result.id = user.userId
  result.name = user.firstName + ' ' + user.lastName
  result.email = user.email
  if (opts != null && opts.includeRole) {
    result.role = user.role || 'viewer'
  }
  return result
}`
    },
    python: {
      filename: "pipeline/transform.py",
      code: `# pipeline/transform.py  — Alice Chen
API_TIMEOUT = 5000
MAX_RETRIES = 3

def process_user_data(d, opts={}):
    output = []
    errors = []

    for u in d:
        if u == None:
            continue
        try:
            if u['status'] != 'active':
                errors.append(u)
                continue
            t = transform_user(u, opts)
            if t != None:
                output.append(t)
        except:
            errors.append(u)

    return {'output': output, 'errors': errors}

def transform_user(u, opts={}):
    r = {}
    r['id'] = u.get('userId')
    r['name'] = u.get('firstName', '') + ' ' + u.get('lastName', '')
    r['email'] = u.get('email')
    if opts != None and opts.get('includeRole'):
        r['role'] = u.get('role') or 'viewer'
    return r

def filter_active(d):
    result = []
    for u in d:
        if u != None and u.get('status') == 'active':
            result.append(u)
    return result`
    }
  },

  "Bob Martinez": {
    js: {
      filename: "auth/validator.js",
      code: `// auth/validator.js  — Bob Martinez
const SESSION_TIMEOUT = 3600
const MAX_LOGIN_ATTEMPTS = 5

function validateSession(session, user) {
  if (session == null) {
    return { valid: false, reason: 'No session' }
  }

  var elapsed = Date.now() - session.createdAt

  if (session.type != 'bearer' && session.type != 'api_key') {
    return { valid: false, reason: 'Invalid token type' }
  }

  if (elapsed > SESSION_TIMEOUT * 1000) {
    return { valid: false, reason: 'Session expired' }
  }

  if (session.userId != user.id) {
    return { valid: false, reason: 'User mismatch' }
  }

  var attempts = session.loginAttempts || 0
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return { valid: false, reason: 'Too many attempts' }
  }

  return { valid: true, userId: session.userId }
}

function hasPermission(user, resource, action) {
  if (user == null || resource == null) {
    return false
  }
  var perms = user.permissions || []
  for (var i = 0; i < perms.length; i++) {
    if (perms[i].resource == resource && perms[i].action == action) {
      return true
    }
  }
  return false
}`
    },
    python: {
      filename: "auth/validator.py",
      code: `# auth/validator.py  — Bob Martinez
import time
import random
import string

SESSION_TIMEOUT = 3600
MAX_LOGIN_ATTEMPTS = 5
TOKEN_LENGTH = 32

def validate_session(s, u):
    if s == None:
        return {'valid': False, 'reason': 'No session'}

    age = time.time() - s.get('created_at', 0)

    if age > SESSION_TIMEOUT:
        return {'valid': False, 'reason': 'Session expired'}

    if s.get('user_id') != u.get('id'):
        return {'valid': False, 'reason': 'User mismatch'}

    attempts = s.get('login_attempts') or 0
    if attempts >= MAX_LOGIN_ATTEMPTS:
        return {'valid': False, 'reason': 'Too many attempts'}

    return {'valid': True, 'user_id': s.get('user_id')}

def generate_token(n):
    c = string.ascii_letters + string.digits
    t = ''
    for i in range(n):
        t += random.choice(c)
    return t

def hash_password(p, s=None):
    try:
        import hashlib
        if s == None:
            s = generate_token(16)
        h = hashlib.sha256((p + s).encode()).hexdigest()
        return h + ':' + s
    except:
        return None`
    }
  },

  "Carol Liu": {
    js: {
      filename: "api/userService.js",
      code: `// api/userService.js  — Carol Liu
function getUserProfile(userId, db) {
  const user = db.find(entry => entry.id == userId)

  if (user == null) {
    return null
  }

  const profile = {
    id: user.id,
    name: user.name,
    email: user.email
  }

  if (user.settings != null && user.settings.theme != null) {
    profile.theme = user.settings.theme
  } else {
    profile.theme = 'light'
  }

  if (user.org != null && user.org.team != null && user.org.team.name != null) {
    profile.team = user.org.team.name
  }

  if (user.address != null && user.address.city != null) {
    profile.city = user.address.city
  }

  if (user.preferences != null) {
    if (user.preferences.notifications != null) {
      profile.notifications = user.preferences.notifications
    }
    if (user.preferences.language != null) {
      profile.language = user.preferences.language
    }
    if (user.preferences.timezone != null) {
      profile.timezone = user.preferences.timezone
    }
  }

  return profile
}`
    },
    python: {
      filename: "api/user_service.py",
      code: `# api/user_service.py  — Carol Liu
def get_user_profile(user_id, db):
    u = None
    for item in db:
        if item.get('id') == user_id:
            u = item
            break

    if u == None:
        return None

    p = {
        'id': u.get('id'),
        'name': u.get('name'),
        'email': u.get('email'),
    }

    if u.get('settings') != None and u.get('settings').get('theme') != None:
        p['theme'] = u.get('settings').get('theme')
    else:
        p['theme'] = 'light'

    if u.get('org') != None:
        if u.get('org').get('team') != None:
            if u.get('org').get('team').get('name') != None:
                p['team'] = u.get('org').get('team').get('name')

    if u.get('preferences') != None:
        prefs = u.get('preferences')
        if prefs.get('notifications') != None:
            p['notifications'] = prefs.get('notifications')
        if prefs.get('language') != None:
            p['language'] = prefs.get('language')

    return p

def update_user(user_id, db, updates={}):
    for item in db:
        if item.get('id') == user_id:
            for k in updates:
                item[k] = updates[k]
            return item
    return None`
    }
  },

  "David Kim": {
    js: {
      filename: "utils/helpers.js",
      code: `// utils/helpers.js  — David Kim
function p(a, b, c) {
  var r = 0
  for (var i = 0; i < a.length; i++) {
    if (a[i] != null && a[i][b] != null) {
      r += a[i][b]
    }
  }
  return c ? r / a.length : r
}

function f(d, k, v) {
  var r = []
  for (var i = 0; i < d.length; i++) {
    if (d[i][k] == v) {
      r.push(d[i])
    }
  }
  return r
}

function s(a, k, o) {
  var r = []
  for (var i = 0; i < a.length; i++) {
    r.push(a[i])
  }
  r.sort(function(x, y) {
    if (x[k] < y[k]) return o == 'asc' ? -1 : 1
    if (x[k] > y[k]) return o == 'asc' ? 1 : -1
    return 0
  })
  return r
}`
    },
    python: {
      filename: "utils/helpers.py",
      code: `# utils/helpers.py  — David Kim
def p(a, b, c=False):
    r = 0
    for item in a:
        if item != None and item.get(b) != None:
            r += item.get(b)
    if c:
        return r / len(a)
    return r

def f(d, k, v):
    r = []
    for item in d:
        try:
            if item[k] == v:
                r.append(item)
        except:
            pass
    return r

def s(a, k, o='asc'):
    r = list(a)
    try:
        r.sort(key=lambda x: x.get(k) if x.get(k) != None else '',
               reverse=(o == 'desc'))
    except:
        pass
    return r

def g(d, k, default=None):
    try:
        keys = k.split('.')
        v = d
        for key in keys:
            if v == None:
                return default
            v = v.get(key)
        return v if v != None else default
    except:
        return default`
    }
  },

  "Eve Patel": {
    js: {
      filename: "config/pricing.js",
      code: `// config/pricing.js  — Eve Patel
function calculatePrice(quantity, tier, discountPercent) {
  var price = 0

  if (tier == 'premium') {
    price = quantity * 29.99
  } else if (tier == 'standard') {
    price = quantity * 14.99
  } else {
    price = quantity * 9.99
  }

  if (quantity > 100) {
    price = price * 0.85
  } else if (quantity > 50) {
    price = price * 0.90
  } else if (quantity > 10) {
    price = price * 0.95
  }

  if (discountPercent != null && discountPercent > 0) {
    price = price - (price * discountPercent / 100)
  }

  var tax = price * 0.08875
  return Math.round((price + tax) * 100) / 100
}

function getVolumeDiscount(quantity) {
  var discount = 0
  if (quantity >= 500) discount = 20
  else if (quantity >= 200) discount = 15
  else if (quantity >= 100) discount = 10
  else if (quantity >= 50) discount = 5
  return discount
}`
    },
    python: {
      filename: "config/pricing.py",
      code: `# config/pricing.py  — Eve Patel
def calculate_price(q, t, d=None):
    p = 0

    if t == 'premium':
        p = q * 29.99
    elif t == 'standard':
        p = q * 14.99
    else:
        p = q * 9.99

    if q > 100:
        p = p * 0.85
    elif q > 50:
        p = p * 0.90
    elif q > 10:
        p = p * 0.95

    if d != None and d > 0:
        p = p - (p * d / 100)

    tax = p * 0.08875
    return round(p + tax, 2)

def get_tier_config(tiers=[]):
    result = {}
    for t in tiers:
        if t.get('name') != None:
            result[t['name']] = t
    return result

def apply_promo(price, code, promos={}):
    try:
        if promos.get(code) != None:
            discount = promos[code]
            return price * (1 - discount / 100)
        return price
    except:
        return price`
    }
  }
};

const ENGINEERS = Object.keys(ENGINEER_CODE);

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

async function safeJsonResponse(res) {
  const text = await res.text();
  if (!text || text.trim() === "") {
    throw new Error("Server returned empty response. Check that the backend is reachable.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server error: ${text.slice(0, 120)}`);
  }
}

export default function App() {
  const [engineer, setEngineer] = useState(ENGINEERS[0]);
  const [language, setLanguage] = useState("javascript");

  const getSnippet = (eng, lang) => ENGINEER_CODE[eng]?.[lang === "python" ? "python" : "js"];

  const [code, setCode] = useState(() => getSnippet(ENGINEERS[0], "javascript").code);
  const [originalCode, setOriginalCode] = useState(() => getSnippet(ENGINEERS[0], "javascript").code);

  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);

  const [refactoring, setRefactoring] = useState(false);
  const [refactorOptions, setRefactorOptions] = useState(null);
  const [appliedOption, setAppliedOption] = useState(null);
  const [refactorError, setRefactorError] = useState(null);

  const [teamContext, setTeamContext] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/team-context`)
      .then(r => r.json())
      .then(setTeamContext)
      .catch(console.error);
  }, []);

  const resetDiagnosis = () => {
    setDiagnosis(null);
    setRefactorOptions(null);
    setAppliedOption(null);
    setAnalyzeError(null);
    setRefactorError(null);
  };

  const handleEngineerChange = (newEngineer) => {
    const snippet = getSnippet(newEngineer, language);
    setEngineer(newEngineer);
    setCode(snippet.code);
    setOriginalCode(snippet.code);
    resetDiagnosis();
  };

  const handleLanguageChange = (newLang) => {
    const snippet = getSnippet(engineer, newLang);
    setLanguage(newLang);
    setCode(snippet.code);
    setOriginalCode(snippet.code);
    resetDiagnosis();
  };

  const addAuditEntry = useCallback((action, label, detail) => {
    setAuditLog(prev => [...prev, { action, label, detail, engineer, timestamp: timestamp() }]);
  }, [engineer]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError(null);
    setDiagnosis(null);
    setRefactorOptions(null);
    setAppliedOption(null);
    addAuditEntry("analyze", "Code Analyzed", `${code.split("\n").length} lines · ${language}`);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, engineer })
      });
      const data = await safeJsonResponse(res);
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setDiagnosis(data);
      setOriginalCode(code);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefactor = async () => {
    if (!diagnosis) return;
    setRefactoring(true);
    setRefactorError(null);
    setRefactorOptions(null);
    setAppliedOption(null);
    addAuditEntry("refactor_generate", "Refactor Options Generated", `Based on ${diagnosis.issues?.length || 0} issues`);

    try {
      const res = await fetch(`${API_BASE}/api/refactor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: originalCode, language, issues: diagnosis.issues, engineer })
      });
      const data = await safeJsonResponse(res);
      if (!res.ok) throw new Error(data.error || "Refactor generation failed");
      setRefactorOptions(data.options || []);
    } catch (err) {
      setRefactorError(err.message);
    } finally {
      setRefactoring(false);
    }
  };

  const handleApply = (option) => {
    setCode(option.code);
    setAppliedOption(option);
    addAuditEntry("refactor_apply", `Applied: ${option.title}`, option.description);
  };

  const handleRollback = () => {
    setCode(originalCode);
    setAppliedOption(null);
    addAuditEntry("rollback", "Rolled Back to Original", "Restored pre-refactor code");
  };

  const handleReset = () => {
    const snippet = getSnippet(engineer, language);
    setCode(snippet.code);
    setOriginalCode(snippet.code);
    resetDiagnosis();
  };

  const currentFilename = getSnippet(engineer, language)?.filename || "index.js";
  const errorCount = diagnosis?.issues?.filter(i => i.severity === "error").length || 0;
  const warnCount = diagnosis?.issues?.filter(i => i.severity === "warning").length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Top nav */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              DM
            </div>
            <span className="font-bold text-slate-100 text-base tracking-tight">DevMind</span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:block">Team AI Code Intelligence</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {engineer.charAt(0)}
            </div>
            <select
              value={engineer}
              onChange={e => handleEngineerChange(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700/60 text-slate-300 rounded px-2 py-1 cursor-pointer focus:outline-none focus:border-violet-500"
            >
              {ENGINEERS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <select
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700/60 text-slate-300 rounded px-2 py-1 cursor-pointer focus:outline-none focus:border-violet-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700/60 hover:border-slate-600 px-2.5 py-1 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: Code Editor */}
        <div className="w-[40%] min-w-0 flex flex-col border-r border-slate-800/80">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">{currentFilename}</span>
            </div>
            <div className="flex items-center gap-2">
              {diagnosis && (
                <div className="flex items-center gap-1.5 text-xs">
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {errorCount} error{errorCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {warnCount > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      {warnCount} warn{warnCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
              {appliedOption && (
                <span className="text-xs text-green-400 font-medium bg-green-900/20 px-2 py-0.5 rounded border border-green-700/30">
                  Refactored
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-3 bg-slate-900/40 border-r border-slate-800/40 select-none overflow-hidden pointer-events-none">
              {code.split("\n").map((_, i) => (
                <span key={i} className="text-xs text-slate-700 font-mono text-right pr-2 leading-6">
                  {i + 1}
                </span>
              ))}
            </div>
            <textarea
              className="code-editor absolute inset-0 pl-12 pr-3 pt-3 pb-3 w-full h-full bg-transparent text-slate-200 text-xs leading-6 font-mono"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div className="flex-shrink-0 p-3 bg-slate-900/40 border-t border-slate-800/60">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition-colors duration-150 shadow-lg shadow-indigo-900/40"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* MIDDLE: Diagnosis + Refactor */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-slate-800/80">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {!analyzing && !diagnosis && !analyzeError && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">No diagnosis yet</p>
                <p className="text-slate-600 text-xs">
                  Click "Analyze Code" to run AI diagnostics on {engineer.split(" ")[0]}'s {language === "python" ? "Python" : "JavaScript"}
                </p>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Running analysis...</p>
                  <p className="text-xs text-slate-600 mt-1">Static analysis + AI diagnosis + team context</p>
                </div>
              </div>
            )}

            {analyzeError && (
              <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Analysis Failed</p>
                <p className="text-xs text-red-300/80">{analyzeError}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Make sure the server is running: <code className="font-mono">npm start</code> from the project root.
                </p>
              </div>
            )}

            {diagnosis && !analyzing && (
              <DiagnosisPanel
                diagnosis={diagnosis}
                onRefactor={handleRefactor}
                refactoring={refactoring}
              />
            )}

            {refactoring && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                <p className="text-sm text-slate-400">Generating refactor options...</p>
              </div>
            )}

            {refactorError && (
              <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-3">
                <p className="text-xs font-semibold text-red-400">Refactor Failed</p>
                <p className="text-xs text-red-300/80 mt-1">{refactorError}</p>
              </div>
            )}

            {refactorOptions && !refactoring && (
              <RefactorPanel
                options={refactorOptions}
                originalCode={originalCode}
                onApply={handleApply}
                onRollback={handleRollback}
                appliedOption={appliedOption}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Team Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col p-4 overflow-hidden bg-slate-900/30">
          <TeamSidebar teamContext={teamContext} />
        </div>
      </div>

      {/* Bottom: Audit Log */}
      <div className="flex-shrink-0 border-t border-slate-800/80 bg-slate-900/60">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Audit Log</span>
            {auditLog.length > 0 && (
              <span className="text-xs text-slate-600">{auditLog.length} event{auditLog.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <AuditLog entries={auditLog} />
        </div>
      </div>
    </div>
  );
}
