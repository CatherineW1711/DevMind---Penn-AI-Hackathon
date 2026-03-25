/**
 * Mock LLM responses for demo / offline mode.
 * Activated by setting MOCK_LLM=true in .env
 */

// Per-engineer primary issue profiles — drives the headline summary and issue ordering
const ENGINEER_PROFILE = {
  "Alice Chen": {
    primaryType: "prefer-array-methods",
    overrideSeverity: "high",
    summary: (firstName, lang, errorCount, warnCount) =>
      `${firstName}'s ${lang} pipeline file uses legacy 'var' declarations throughout and manual for-loops that should be Array.filter()/.map(). ` +
      `This is the exact pattern Alice is actively refactoring across the team — having it in her own module creates inconsistency. ` +
      `${errorCount} lint error${errorCount !== 1 ? "s" : ""} would block the PR in CI.`,
    teamImpact: "Alice's last 3 PRs flagged the same var + for-loop pattern. The team's pipeline refactor sprint won't close until this file is updated — it's on the board.",
    issueContext: {
      "no-var": "Alice is leading the var → const/let migration across the pipeline module. Having it in her own transform.js undercuts the team-wide effort.",
      "prefer-array-methods": "Alice's commit 2 hours ago replaced for-loops with Array.filter() in the data pipeline — but transform.js wasn't included. This is the remaining file.",
      "eqeqeq": "Loose equality in data comparisons can silently accept unexpected types — a known source of data quality bugs in the pipeline.",
      "no-loose-null-check": "Explicit null checks here are redundant once Array.filter() is used — filtering nulls before processing eliminates the need entirely."
    }
  },
  "Bob Martinez": {
    primaryType: "eqeqeq",
    overrideSeverity: "critical",
    summary: (firstName, lang, errorCount, warnCount) =>
      `${firstName}'s auth validator uses loose equality (==, !=) in ${errorCount} security-critical comparisons. ` +
      `In auth code, '==' coercion can cause session.userId == user.id to pass when it shouldn't — for example, when comparing a number to a numeric string. ` +
      `The security checklist explicitly requires strict equality in all auth modules, and this file would be flagged in the next security audit.`,
    teamImpact: "Auth modules are the highest-risk area for == coercion bugs. Bob fixed var declarations in this file 5 hours ago but the equality checks were missed — this is the remaining security debt.",
    issueContext: {
      "eqeqeq": "In auth code, == coercion is a real security risk: '1' == 1 is true in JS. If userId is stored as a string in session but as a number in the DB, this check could silently pass or fail incorrectly.",
      "no-var": "Two var declarations slipped through Bob's recent refactor — elapsed and attempts. These are easy wins before the next security review.",
      "prefer-array-methods": "The permissions loop in hasPermission() is also a candidate for Array.some() — more readable and removes the manual index tracking.",
      "no-loose-null-check": "user == null also matches undefined, which is intentional here — but the security reviewer will flag it as ambiguous. Use !session explicitly."
    }
  },
  "Carol Liu": {
    primaryType: "no-loose-null-check",
    overrideSeverity: "high",
    summary: (firstName, lang, errorCount, warnCount) =>
      `${firstName}'s user service has deeply nested null checks — 8 explicit != null guards that could be replaced with optional chaining (?.) in 2 lines. ` +
      `Carol already introduced optional chaining across the API layer yesterday, but this file predates that refactor. ` +
      `The nested structure adds ~25 lines of noise that obscures the actual data mapping logic.`,
    teamImpact: "Carol's optional chaining PR reduced 3 other API files by 40% each. This file has the same pattern — applying it here closes the gap and makes getUserProfile consistent with the rest of the API layer.",
    issueContext: {
      "no-loose-null-check": "Eight separate != null guards in one function is a strong signal that optional chaining (?.) is the right tool here. Carol introduced this pattern yesterday — this file is the last holdout.",
      "eqeqeq": "entry.id == userId in the db.find() is a type coercion risk — if IDs are sometimes numbers and sometimes strings, this masks the mismatch instead of failing loudly.",
      "consistent-naming": "This file uses const/let throughout (good) but the db lookup variable naming could be more explicit — 'entry' vs 'user' is ambiguous before the find."
    }
  },
  "David Kim": {
    primaryType: "consistent-naming",
    overrideSeverity: "critical",
    summary: (firstName, lang, errorCount, warnCount) =>
      `${firstName}'s utils file exports three functions — p(), f(), and s() — with single-letter parameters throughout. ` +
      `These names are unsearchable in the codebase, produce meaningless stack traces in production errors, and require reading the entire function body to understand what any call site does. ` +
      `This is the most extreme naming violation in the codebase: ${errorCount} naming errors across 3 functions.`,
    teamImpact: "p(), f(), s() show up in production stack traces as 'TypeError at p' with zero context. The on-call team spent 45 minutes last incident tracing a bug to 'f()' in utils. David renamed other files 2 days ago but this one remains.",
    issueContext: {
      "consistent-naming": "p(a, b, c), f(d, k, v), s(a, k, o) — there are 10+ single-letter identifiers in this file. Every caller, reviewer, and on-call engineer has to decode these from scratch every time.",
      "no-var": "var throughout compounds the readability problem — with descriptive names and const/let, the intent of each function becomes immediately clear.",
      "prefer-array-methods": "p() is sum-with-optional-average, f() is filter-by-value, s() is sort-by-key — all of these are 1-liners with Array.reduce(), .filter(), and sorted().",
      "eqeqeq": "Loose equality in f() means the filter matches by type coercion — filtering users by role 'admin' would also match if role is stored as a number somewhere."
    }
  },
  "Eve Patel": {
    primaryType: "no-var",
    overrideSeverity: "high",
    summary: (firstName, lang, errorCount, warnCount) =>
      `${firstName}'s pricing module has two intertwined problems: it still uses 'var' for mutable price calculations, ` +
      `and every price point (29.99, 14.99, 9.99), discount multiplier (0.85, 0.90, 0.95), and tax rate (0.08875) is hardcoded inline. ` +
      `When the tax rate changed last quarter, this kind of file required a code change + deploy instead of a config update — a 3-hour incident.`,
    teamImpact: "Eve's own recent commit extracted magic numbers from the config module — but pricing.js wasn't included. Finance has requested a price adjustment for Q2; if this file isn't refactored first, that update will touch 8+ hardcoded values across 2 functions.",
    issueContext: {
      "no-var": "var price and var tax inside a calculation function are reassigned throughout — const would enforce the intent that these are computed values, not mutable state.",
      "eqeqeq": "tier == 'premium' is a type coercion risk — if tier comes from a form input or API it's always a string, but if it ever comes from a typed enum it could coerce incorrectly. Use ===.",
      "no-loose-null-check": "discountPercent != null passes for both null and undefined — fine here, but use !== null with an explicit comment so reviewers know the intent.",
      "prefer-array-methods": "The volume discount logic in getVolumeDiscount() is a lookup table — it's cleaner as an Array.find() over a VOLUME_DISCOUNTS config array."
    }
  }
};

function buildMockAnalysis(staticIssues, patternMatches, language, engineer) {
  const errorCount = staticIssues.filter(i => i.severity === "error").length;
  const warnCount = staticIssues.filter(i => i.severity === "warning").length;
  const firstName = engineer ? engineer.split(" ")[0] : "This";

  const profile = ENGINEER_PROFILE[engineer];

  // Build the summary — use engineer-specific headline if available
  const summary = profile
    ? profile.summary(firstName, language, errorCount, warnCount)
    : (() => {
        const hasVar = staticIssues.some(i => i.type === "no-var");
        const hasForLoop = staticIssues.some(i => i.type === "prefer-array-methods");
        const hasEqeq = staticIssues.some(i => i.type === "eqeqeq");
        const hasNaming = staticIssues.some(i => i.type === "consistent-naming");
        const parts = [];
        if (hasVar) parts.push("uses legacy 'var' declarations");
        if (hasNaming) parts.push("uses single-letter variable names");
        if (hasEqeq) parts.push("uses loose equality operators");
        if (hasForLoop) parts.push("uses manual for-loops");
        return parts.length > 0
          ? `${firstName}'s ${language} code ${parts.slice(0, 2).join(" and ")}. ${errorCount} error${errorCount !== 1 ? "s" : ""} would block the PR in CI.`
          : `Found ${staticIssues.length} issue(s) that violate team standards.`;
      })();

  // Issue explanations — generic baseline, overridden per engineer when profile exists
  const baseExplanations = {
    "no-var": {
      title: "Legacy 'var' Declaration",
      explanation: "'var' is function-scoped and hoisted — variables can be accessed before assignment without throwing. Your team standardized on 'const'/'let' (rule-001) to make scope intent explicit.",
      teamContext: "Bob Martinez refactored the auth module from var → const/let 5 hours ago. 3 engineers have completed their modules — this is one of the last remaining files."
    },
    "eqeqeq": {
      title: "Loose Equality Operator",
      explanation: "Using '!=' / '==' triggers JS type coercion: '0 == false' is true, 'null == undefined' is true, '\"1\" == 1' is true. These silent coercions cause bugs that only appear with certain input types.",
      teamContext: "Strict equality is on the team's 'must fix before merge' list (rule-002) — this will be flagged in code review."
    },
    "prefer-array-methods": {
      title: "Manual for-loop (use Array methods)",
      explanation: "This for-loop builds a filtered/mapped array manually — the exact job of Array.filter()/.map(). Functional methods are more readable, chainable, and eliminate off-by-one index bugs.",
      teamContext: "Alice Chen refactored the pipeline from for-loops to .filter()/.map() 2 hours ago. Team is actively standardizing on functional array methods (rule-005)."
    },
    "consistent-naming": {
      title: "Non-Descriptive Variable Name",
      explanation: "Single-letter names force every reader to mentally reconstruct context from scratch. In stack traces and code reviews, 'p(a, b, c)' gives zero signal about what the function does.",
      teamContext: "David Kim renamed single-letter vars in utils/transform.js 2 days ago. Descriptive naming is enforced in PR reviews (rule-006)."
    },
    "no-loose-null-check": {
      title: "Ambiguous Null Check",
      explanation: "'!= null' catches both null and undefined — may be intentional, but is ambiguous to readers. Your team prefers explicit '!== null' or optional chaining (?.) to signal intent clearly.",
      teamContext: "Carol Liu introduced optional chaining across the API layer yesterday. The team standard is now explicit null safety (rule-007)."
    }
  };

  // Sort issues so the engineer's primary issue type comes first
  const primaryType = profile?.primaryType;
  const sorted = [...staticIssues].sort((a, b) => {
    if (a.type === primaryType) return -1;
    if (b.type === primaryType) return 1;
    return 0;
  });

  // Deduplicate by type, keep first occurrence
  const seen = new Set();
  const deduped = sorted.filter(i => {
    if (seen.has(i.type)) return false;
    seen.add(i.type);
    return true;
  });

  const enrichedIssues = deduped.map(issue => {
    const base = baseExplanations[issue.type] || { title: issue.type, explanation: issue.message, teamContext: "Violates team coding standards." };
    // Use engineer-specific context override if available
    const engineerContext = profile?.issueContext?.[issue.type];
    return {
      type: issue.type,
      severity: issue.severity,
      line: issue.line,
      ruleId: issue.ruleId,
      title: base.title,
      explanation: base.explanation,
      teamContext: engineerContext || base.teamContext
    };
  });

  return {
    summary,
    issues: enrichedIssues,
    overallSeverity: profile?.overrideSeverity || (errorCount >= 4 ? "critical" : errorCount > 0 ? "high" : "medium"),
    teamImpact: profile?.teamImpact || "Inconsistent patterns increase code review time and risk of merge conflicts across the team."
  };
}

const REFACTOR_OPTIONS = {
  "Alice Chen": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Replace var with const/let, fix loose equality to strict. Keeps the for-loop structure intact for easy review.",
        approach: "conservative",
        code: `// data/pipeline.js  — Alice Chen
const API_TIMEOUT = 5000
const MAX_RETRIES = 3

function processUserData(data, opts) {
  const output = []
  const errors = []

  for (let i = 0; i < data.length; i++) {
    const user = data[i]
    if (user === null || user === undefined) {
      continue
    }
    if (user.status !== 'active') {
      errors.push(user)
      continue
    }
    const transformed = transformUser(user, opts)
    if (transformed !== null) {
      output.push(transformed)
    }
  }

  return { output, errors }
}

function transformUser(user, opts) {
  const result = {}
  result.id = user.userId
  result.name = user.firstName + ' ' + user.lastName
  result.email = user.email
  if (opts !== null && opts.includeRole) {
    result.role = user.role || 'viewer'
  }
  return result
}`,
        tradeoffs: {
          pros: ["Smallest diff — easy to review and merge quickly", "Fixes all var and loose equality errors", "Low cognitive overhead for reviewers"],
          cons: ["Still uses manual for-loops (rule-005 warning remains)", "transformUser still uses mutation pattern"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-006"],
        teamAlignment: "Safe for a hotfix or deadline crunch. Won't satisfy Alice's own recent refactor of the pipeline module."
      },
      {
        id: "option-2",
        title: "Functional Array Methods",
        description: "Replace for-loops with .filter() and .reduce(), use optional chaining for null safety. Matches Alice's recent commit pattern.",
        approach: "moderate",
        code: `// data/pipeline.js  — Alice Chen
const API_TIMEOUT = 5000
const MAX_RETRIES = 3

function processUserData(data, opts) {
  const validUsers = data.filter(user => user != null && user.status === 'active')
  const output = validUsers.map(user => transformUser(user, opts)).filter(Boolean)
  const errors = data.filter(user => user != null && user.status !== 'active')

  return { output, errors }
}

function transformUser(user, opts) {
  return {
    id: user.userId,
    name: \`\${user.firstName} \${user.lastName}\`,
    email: user.email,
    ...(opts?.includeRole && { role: user.role || 'viewer' })
  }
}`,
        tradeoffs: {
          pros: ["Matches Alice's own recent refactor pattern exactly", "Passes all lint rules with zero warnings", "Immutable — no mutation of result objects"],
          cons: ["Two separate .filter() passes over data — minor perf tradeoff for large arrays", "Spread syntax requires reviewer familiarity with ES2018"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "This is exactly what Alice did in her pipeline refactor 2 hours ago. Bob Martinez and Carol Liu have already approved this style in recent PRs."
      },
      {
        id: "option-3",
        title: "Single-Pass with reduce()",
        description: "Process output and errors in one pass using reduce(). Most performant for large datasets.",
        approach: "aggressive",
        code: `// data/pipeline.js  — Alice Chen
const API_TIMEOUT = 5000
const MAX_RETRIES = 3

function processUserData(data, opts) {
  return data.reduce(
    (acc, user) => {
      if (user == null) return acc
      if (user.status !== 'active') {
        acc.errors.push(user)
      } else {
        const transformed = transformUser(user, opts)
        if (transformed) acc.output.push(transformed)
      }
      return acc
    },
    { output: [], errors: [] }
  )
}

function transformUser(user, opts) {
  if (!user) return null
  return {
    id: user.userId,
    name: \`\${user.firstName} \${user.lastName}\`,
    email: user.email,
    role: opts?.includeRole ? (user.role || 'viewer') : undefined
  }
}`,
        tradeoffs: {
          pros: ["Single array pass — O(n) vs O(2n) for large datasets", "Fully immutable", "Zero lint warnings"],
          cons: ["reduce() with accumulator pattern has higher cognitive load", "Better suited as a shared utility than inline pipeline code"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "Eve Patel uses this reduce() pattern in the data-processing module. Discuss with Alice before using in the pipeline — she may prefer the explicit filter/map version."
      }
    ]
  },

  "Bob Martinez": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Replace var with const/let, fix loose equality. Keeps the same structure — safe for auth code that reviewers know well.",
        approach: "conservative",
        code: `// auth/validator.js  — Bob Martinez
const SESSION_TIMEOUT = 3600
const MAX_LOGIN_ATTEMPTS = 5
const TOKEN_LENGTH = 32

function validateSession(session, user) {
  if (session === null || session === undefined) {
    return { valid: false, reason: 'No session' }
  }

  const now = Date.now()
  const age = now - session.createdAt

  if (age > SESSION_TIMEOUT * 1000) {
    return { valid: false, reason: 'Session expired' }
  }

  if (session.userId !== user.id) {
    return { valid: false, reason: 'User mismatch' }
  }

  const attempts = session.loginAttempts || 0
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return { valid: false, reason: 'Too many attempts' }
  }

  return { valid: true, userId: session.userId }
}

function generateToken(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}`,
        tradeoffs: {
          pros: ["Minimal diff — critical for auth code where changes are scrutinized", "Fixes all 7 lint errors", "Reviewers can focus on correctness not style"],
          cons: ["generateToken still uses a for-loop (minor)", "Manual string building is slightly less readable than crypto alternatives"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-006"],
        teamAlignment: "Bob's own migration pattern: replace var/== first, structural changes in a follow-up PR. This is safe and mergeable today."
      },
      {
        id: "option-2",
        title: "Modern ES6+ + Optional Chaining",
        description: "Add optional chaining for null safety, use crypto.randomBytes for token generation, extract constants clearly.",
        approach: "moderate",
        code: `// auth/validator.js  — Bob Martinez
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT * 1000
const SESSION_TIMEOUT = 3600
const MAX_LOGIN_ATTEMPTS = 5
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function validateSession(session, user) {
  if (!session) {
    return { valid: false, reason: 'No session' }
  }

  const age = Date.now() - session.createdAt

  if (age > SESSION_TIMEOUT_MS) {
    return { valid: false, reason: 'Session expired' }
  }

  if (session.userId !== user?.id) {
    return { valid: false, reason: 'User mismatch' }
  }

  if ((session.loginAttempts ?? 0) >= MAX_LOGIN_ATTEMPTS) {
    return { valid: false, reason: 'Too many attempts' }
  }

  return { valid: true, userId: session.userId }
}

function generateToken(length) {
  return Array.from({ length }, () =>
    TOKEN_CHARS.charAt(Math.floor(Math.random() * TOKEN_CHARS.length))
  ).join('')
}`,
        tradeoffs: {
          pros: ["Optional chaining makes null safety explicit", "Array.from() replaces the for-loop cleanly", "Named SESSION_TIMEOUT_MS is self-documenting"],
          cons: ["The SESSION_TIMEOUT_MS const depends on SESSION_TIMEOUT — ordering matters", "?? operator requires Node 14+"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "Carol Liu uses optional chaining and ?. extensively in the API layer. This style matches what she introduced yesterday."
      },
      {
        id: "option-3",
        title: "Hardened Auth Validation",
        description: "Full rewrite with named error codes, input type guards, and crypto.randomBytes for cryptographically secure tokens.",
        approach: "aggressive",
        code: `// auth/validator.js  — Bob Martinez
const SESSION_TIMEOUT_MS = 3_600_000
const MAX_LOGIN_ATTEMPTS = 5
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const ValidationError = {
  NO_SESSION: 'NO_SESSION',
  EXPIRED: 'SESSION_EXPIRED',
  USER_MISMATCH: 'USER_MISMATCH',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS'
}

function validateSession(session, user) {
  if (!session?.createdAt) {
    return { valid: false, code: ValidationError.NO_SESSION }
  }
  if (Date.now() - session.createdAt > SESSION_TIMEOUT_MS) {
    return { valid: false, code: ValidationError.EXPIRED }
  }
  if (session.userId !== user?.id) {
    return { valid: false, code: ValidationError.USER_MISMATCH }
  }
  if ((session.loginAttempts ?? 0) >= MAX_LOGIN_ATTEMPTS) {
    return { valid: false, code: ValidationError.TOO_MANY_ATTEMPTS }
  }
  return { valid: true, userId: session.userId }
}

function generateToken(length = 32) {
  return Array.from({ length }, () =>
    TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)]
  ).join('')
}`,
        tradeoffs: {
          pros: ["Error codes instead of strings prevent typo-based bugs in callers", "Numeric separators (3_600_000) are immediately readable", "Default parameter reduces call-site boilerplate"],
          cons: ["Error code enum is a behavior change — callers checking 'reason' string will break", "Larger diff requires a broader PR review"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "Recommended if you're refactoring auth comprehensively. Coordinate with the team — callers in login.js and middleware.js will need updating."
      }
    ]
  },

  "Carol Liu": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Replace var with const, fix loose equality in the db.find() call. Keeps the nested if-structure familiar to reviewers.",
        approach: "conservative",
        code: `// api/userService.js  — Carol Liu
function getUserProfile(userId, db) {
  const user = db.find(function(u) { return u.id === userId })

  if (user === null || user === undefined) {
    return null
  }

  const profile = {
    id: user.id,
    name: user.name,
    email: user.email
  }

  if (user.settings !== null && user.settings.theme !== null) {
    profile.theme = user.settings.theme
  } else {
    profile.theme = 'light'
  }

  if (user.org !== null && user.org.team !== null && user.org.team.name !== null) {
    profile.team = user.org.team.name
  }

  if (user.preferences !== null) {
    if (user.preferences.notifications !== null) {
      profile.notifications = user.preferences.notifications
    }
    if (user.preferences.language !== null) {
      profile.language = user.preferences.language
    }
  }

  return profile
}`,
        tradeoffs: {
          pros: ["Minimal change — safe and easy to review", "Fixes the critical equality bug in db.find()"],
          cons: ["Still 40+ lines of nested null checks", "Deep nesting is still a readability issue"]
        },
        rulesApplied: ["rule-001", "rule-002"],
        teamAlignment: "Acceptable as a quick fix before Carol's own optional chaining PR lands."
      },
      {
        id: "option-2",
        title: "Optional Chaining (Recommended)",
        description: "Replace all nested null checks with optional chaining (?.) and nullish coalescing (??). Cuts file size in half.",
        approach: "moderate",
        code: `// api/userService.js  — Carol Liu
function getUserProfile(userId, db) {
  const user = db.find(u => u.id === userId)
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    theme: user.settings?.theme ?? 'light',
    team: user.org?.team?.name,
    notifications: user.preferences?.notifications,
    language: user.preferences?.language
  }
}`,
        tradeoffs: {
          pros: ["40 lines → 13 lines, same behavior", "This is exactly the pattern Carol introduced yesterday", "Optional chaining is self-documenting: 'get this if it exists'"],
          cons: ["Requires Node 14+ / modern browser for ?.  operator", "Returns undefined instead of omitting keys — callers should handle both"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-006", "rule-007"],
        teamAlignment: "This is Carol's own pattern from yesterday's PR. Bob Martinez and Eve Patel already reviewed and approved it."
      },
      {
        id: "option-3",
        title: "Typed + Validated",
        description: "Add JSDoc types, validate inputs, and make the default values explicit. Best for a public API boundary.",
        approach: "aggressive",
        code: `// api/userService.js  — Carol Liu
const DEFAULT_THEME = 'light'

/**
 * @param {string} userId
 * @param {Array<{id: string, name: string, email: string, settings?: object, org?: object, preferences?: object}>} db
 * @returns {object|null}
 */
function getUserProfile(userId, db) {
  if (!userId || !Array.isArray(db)) return null

  const user = db.find(u => u.id === userId)
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    theme: user.settings?.theme ?? DEFAULT_THEME,
    team: user.org?.team?.name ?? null,
    notifications: user.preferences?.notifications ?? null,
    language: user.preferences?.language ?? null
  }
}`,
        tradeoffs: {
          pros: ["Explicit null returns (vs undefined) make caller contracts clear", "Input validation prevents TypeError on bad callers", "JSDoc enables IDE autocomplete for consumers"],
          cons: ["JSDoc maintenance overhead", "Slightly more verbose than option 2"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-006", "rule-007"],
        teamAlignment: "Recommended for shared service functions. Discuss with Carol — she may want to combine this with her optional chaining PR."
      }
    ]
  },

  "David Kim": {
    options: [
      {
        id: "option-1",
        title: "Rename Only",
        description: "Just rename the cryptic single-letter function and variable names to descriptive ones. No structural changes.",
        approach: "conservative",
        code: `// utils/helpers.js  — David Kim
function sumField(items, fieldName, average) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    if (items[i] != null && items[i][fieldName] != null) {
      total += items[i][fieldName]
    }
  }
  return average ? total / items.length : total
}

function filterByValue(data, key, value) {
  var result = []
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      result.push(data[i])
    }
  }
  return result
}

function sortByKey(array, key, order) {
  var copy = []
  for (var i = 0; i < array.length; i++) {
    copy.push(array[i])
  }
  copy.sort(function(a, b) {
    if (a[key] < b[key]) return order == 'asc' ? -1 : 1
    if (a[key] > b[key]) return order == 'asc' ? 1 : -1
    return 0
  })
  return copy
}`,
        tradeoffs: {
          pros: ["Trivial to review — purely a rename", "Unblocks any on-call engineer who needs to search for these functions"],
          cons: ["Still uses var and for-loops", "== comparisons still present"]
        },
        rulesApplied: ["rule-006"],
        teamAlignment: "This is the pattern David Kim himself did in utils/transform.js 2 days ago — just descriptive renaming."
      },
      {
        id: "option-2",
        title: "ES6+ Modernization",
        description: "Rename everything and replace for-loops with functional array methods. Matches team standards fully.",
        approach: "moderate",
        code: `// utils/helpers.js  — David Kim
function sumField(items, fieldName, returnAverage = false) {
  const total = items
    .filter(item => item != null && item[fieldName] != null)
    .reduce((sum, item) => sum + item[fieldName], 0)
  return returnAverage ? total / items.length : total
}

function filterByValue(data, key, value) {
  return data.filter(item => item[key] === value)
}

function sortByKey(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
}`,
        tradeoffs: {
          pros: ["filterByValue: 8 lines → 1 line", "sortByKey uses spread to avoid mutating input array", "Fixes all lint errors and warnings", "Passes strict equality throughout"],
          cons: ["filterByValue behavior change: strict equality (===) vs original loose (==) — verify callers"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-005", "rule-006"],
        teamAlignment: "Alice Chen applied this exact functional pattern to the pipeline module 2 hours ago. Bob Martinez approved it."
      },
      {
        id: "option-3",
        title: "Generic Utility Library",
        description: "Production-ready utilities with JSDoc, input validation, and consistent error handling. Ready to export as a shared module.",
        approach: "aggressive",
        code: `// utils/helpers.js  — David Kim

/**
 * Sum a numeric field across an array of objects.
 * @param {object[]} items
 * @param {string} fieldName
 * @param {boolean} [returnAverage=false]
 * @returns {number}
 */
function sumField(items, fieldName, returnAverage = false) {
  if (!Array.isArray(items) || items.length === 0) return 0
  const validItems = items.filter(item => item?.[fieldName] != null)
  const total = validItems.reduce((sum, item) => sum + item[fieldName], 0)
  return returnAverage ? total / validItems.length : total
}

/**
 * Filter an array of objects by a key-value pair.
 * @param {object[]} data
 * @param {string} key
 * @param {*} value
 * @returns {object[]}
 */
function filterByValue(data, key, value) {
  if (!Array.isArray(data)) return []
  return data.filter(item => item[key] === value)
}

/**
 * Sort an array of objects by a key, returning a new array.
 * @param {object[]} array
 * @param {string} key
 * @param {'asc'|'desc'} [order='asc']
 * @returns {object[]}
 */
function sortByKey(array, key, order = 'asc') {
  if (!Array.isArray(array)) return []
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
}`,
        tradeoffs: {
          pros: ["Full JSDoc enables IDE autocomplete and type checking", "Input guards prevent silent failures", "sumField uses validItems.length for correct average when some values are null"],
          cons: ["JSDoc adds maintenance cost", "Best justified if this file is imported by 3+ other modules"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "Eve Patel uses this documented utility pattern in config/. Discuss with David whether this warrants moving to a shared @team/utils package."
      }
    ]
  },

  "Eve Patel": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Replace var with const/let, fix loose equality for the tier comparison, rename single-letter params.",
        approach: "conservative",
        code: `// config/pricing.js  — Eve Patel
function calculatePrice(quantity, tier, discountPercent) {
  let price = 0

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

  const tax = price * 0.08875
  return Math.round((price + tax) * 100) / 100
}`,
        tradeoffs: {
          pros: ["Minimal diff, easy to review", "Descriptive param names eliminate confusion", "Fixes var and naming violations"],
          cons: ["Magic numbers 29.99, 14.99, 0.85, 0.08875 still in code", "Changing any price requires a code change + deploy"]
        },
        rulesApplied: ["rule-001", "rule-006"],
        teamAlignment: "Acceptable for a hotfix, but Eve Patel's own refactor pattern (from her recent commit) would extract these numbers as named constants."
      },
      {
        id: "option-2",
        title: "Named Constants (Recommended)",
        description: "Extract all magic numbers to named constants at the top. Matches Eve's recent refactor commit exactly.",
        approach: "moderate",
        code: `// config/pricing.js  — Eve Patel
const TIER_PRICES = {
  premium: 29.99,
  standard: 14.99,
  basic: 9.99
}

const VOLUME_DISCOUNTS = [
  { minQty: 100, multiplier: 0.85 },
  { minQty: 50,  multiplier: 0.90 },
  { minQty: 10,  multiplier: 0.95 }
]

const TAX_RATE = 0.08875

function calculatePrice(quantity, tier, discountPercent) {
  const unitPrice = TIER_PRICES[tier] ?? TIER_PRICES.basic
  let price = quantity * unitPrice

  const volumeDiscount = VOLUME_DISCOUNTS.find(d => quantity > d.minQty)
  if (volumeDiscount) {
    price *= volumeDiscount.multiplier
  }

  if (discountPercent != null && discountPercent > 0) {
    price -= price * discountPercent / 100
  }

  const tax = price * TAX_RATE
  return Math.round((price + tax) * 100) / 100
}`,
        tradeoffs: {
          pros: ["Price changes require editing one constant, not hunting through logic", "VOLUME_DISCOUNTS array makes the tier structure obvious and extensible", "TAX_RATE is searchable and documentable", "Passes all lint rules"],
          cons: ["VOLUME_DISCOUNTS.find() picks the first matching tier — ordering matters (highest qty first)"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-004", "rule-006", "rule-007"],
        teamAlignment: "This is exactly the pattern Eve Patel applied in her recent 'extract magic numbers' commit. David Kim and Alice Chen both reviewed and approved it."
      },
      {
        id: "option-3",
        title: "Config-Driven Pricing",
        description: "Fully data-driven — pricing rules come from a config object that can be updated without code changes.",
        approach: "aggressive",
        code: `// config/pricing.js  — Eve Patel
const PRICING_CONFIG = {
  tiers: {
    premium:  { unitPrice: 29.99 },
    standard: { unitPrice: 14.99 },
    basic:    { unitPrice: 9.99  }
  },
  volumeDiscounts: [
    { threshold: 100, rate: 0.15 },
    { threshold: 50,  rate: 0.10 },
    { threshold: 10,  rate: 0.05 }
  ],
  taxRate: 0.08875
}

function applyVolumeDiscount(price, quantity, discounts) {
  const applicable = discounts.find(d => quantity > d.threshold)
  return applicable ? price * (1 - applicable.rate) : price
}

function calculatePrice(quantity, tier, discountPercent = 0) {
  const { tiers, volumeDiscounts, taxRate } = PRICING_CONFIG
  const unitPrice = tiers[tier]?.unitPrice ?? tiers.basic.unitPrice

  let price = quantity * unitPrice
  price = applyVolumeDiscount(price, quantity, volumeDiscounts)

  if (discountPercent > 0) {
    price *= (1 - discountPercent / 100)
  }

  return Math.round(price * (1 + taxRate) * 100) / 100
}`,
        tradeoffs: {
          pros: ["PRICING_CONFIG can be loaded from a database or feature flag system", "applyVolumeDiscount is independently testable", "discount rates expressed as 0.15 (15%) instead of multiplier 0.85 — more intuitive"],
          cons: ["Largest structural change — requires broader PR review", "Overkill if pricing rarely changes; best when config comes from an external source"]
        },
        rulesApplied: ["rule-001", "rule-002", "rule-003", "rule-004", "rule-005", "rule-006", "rule-007"],
        teamAlignment: "Best if pricing rules will move to a CMS or admin panel in the future. Discuss with Eve — she mentioned this in last week's architecture meeting."
      }
    ]
  }
};

const PYTHON_REFACTOR_OPTIONS = {
  "Alice Chen": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Fix mutable default arg, replace == None with is None, remove bare except. Safe, minimal diff.",
        approach: "conservative",
        code: `# pipeline/transform.py  — Alice Chen
API_TIMEOUT = 5000
MAX_RETRIES = 3

def process_user_data(d, opts=None):
    if opts is None:
        opts = {}
    output = []
    errors = []

    for u in d:
        if u is None:
            continue
        try:
            if u['status'] != 'active':
                errors.append(u)
                continue
            t = transform_user(u, opts)
            if t is not None:
                output.append(t)
        except KeyError as e:
            errors.append(u)

    return {'output': output, 'errors': errors}

def transform_user(u, opts=None):
    if opts is None:
        opts = {}
    result = {}
    result['id'] = u.get('userId')
    result['name'] = u.get('firstName', '') + ' ' + u.get('lastName', '')
    result['email'] = u.get('email')
    if opts.get('includeRole'):
        result['role'] = u.get('role') or 'viewer'
    return result

def filter_active(d):
    return [u for u in d if u is not None and u.get('status') == 'active']`,
        tradeoffs: {
          pros: ["Fixes mutable default arg bug (rule-py-003)", "is None is PEP 8 compliant", "Specific exception catch is safer than bare except"],
          cons: ["Still uses imperative loops instead of list comprehensions"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004"],
        teamAlignment: "Safe minimal fix. Alice's own refactor direction would also replace loops with comprehensions."
      },
      {
        id: "option-2",
        title: "Pythonic List Comprehensions",
        description: "Replace for-loops with list comprehensions, use is None, fix mutable defaults. Matches Python team style guide.",
        approach: "moderate",
        code: `# pipeline/transform.py  — Alice Chen
API_TIMEOUT = 5000
MAX_RETRIES = 3

def process_user_data(data, opts=None):
    if opts is None:
        opts = {}

    valid = [u for u in data if u is not None]
    output = [t for u in valid if u.get('status') == 'active'
              for t in [transform_user(u, opts)] if t is not None]
    errors = [u for u in valid if u.get('status') != 'active']

    return {'output': output, 'errors': errors}

def transform_user(user, opts=None):
    if user is None:
        return None
    return {
        'id': user.get('userId'),
        'name': f"{user.get('firstName', '')} {user.get('lastName', '')}".strip(),
        'email': user.get('email'),
        'role': (user.get('role') or 'viewer') if opts and opts.get('includeRole') else None
    }

def filter_active(data):
    return [u for u in data if u is not None and u.get('status') == 'active']`,
        tradeoffs: {
          pros: ["Pythonic — list comprehensions are the team-standard pattern", "f-string for name is more readable than concatenation", "Zero PEP 8 violations"],
          cons: ["Nested comprehension in process_user_data is dense — split into named steps if readability matters more than brevity"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004"],
        teamAlignment: "Carol Liu uses this comprehension pattern in the API layer. Alice has been adopting it in the pipeline module."
      },
      {
        id: "option-3",
        title: "Type-Annotated + Dataclasses",
        description: "Full rewrite with type hints, dataclass for UserProfile, and explicit error handling. Production-ready.",
        approach: "aggressive",
        code: `# pipeline/transform.py  — Alice Chen
from dataclasses import dataclass, field
from typing import Optional

API_TIMEOUT = 5000
MAX_RETRIES = 3

@dataclass
class UserProfile:
    id: Optional[str]
    name: str
    email: Optional[str]
    role: str = 'viewer'

@dataclass
class PipelineResult:
    output: list = field(default_factory=list)
    errors: list = field(default_factory=list)

def process_user_data(data: list, opts: Optional[dict] = None) -> PipelineResult:
    result = PipelineResult()
    for user in (u for u in data if u is not None):
        if user.get('status') != 'active':
            result.errors.append(user)
        else:
            profile = transform_user(user, opts or {})
            if profile is not None:
                result.output.append(profile)
    return result

def transform_user(user: dict, opts: Optional[dict] = None) -> Optional[UserProfile]:
    if not user:
        return None
    return UserProfile(
        id=user.get('userId'),
        name=f"{user.get('firstName', '')} {user.get('lastName', '')}".strip(),
        email=user.get('email'),
        role=user.get('role', 'viewer') if opts and opts.get('includeRole') else 'viewer'
    )`,
        tradeoffs: {
          pros: ["Type annotations enable mypy static analysis", "Dataclasses are self-documenting and serializable", "Generator expression in process_user_data is memory-efficient for large datasets"],
          cons: ["Requires Python 3.7+", "Dataclass output means callers need to update from dict to attribute access"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004"],
        teamAlignment: "Eve Patel introduced type annotations in the config module. Discuss with Alice — this is the direction the team is moving."
      }
    ]
  },

  "Bob Martinez": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Fix is None checks, mutable default arg, bare except, and rename single-letter vars.",
        approach: "conservative",
        code: `# auth/validator.py  — Bob Martinez
import time
import random
import string

SESSION_TIMEOUT = 3600
MAX_LOGIN_ATTEMPTS = 5
TOKEN_LENGTH = 32

def validate_session(session, user):
    if session is None:
        return {'valid': False, 'reason': 'No session'}

    age = time.time() - session.get('created_at', 0)

    if age > SESSION_TIMEOUT:
        return {'valid': False, 'reason': 'Session expired'}

    if session.get('user_id') != user.get('id'):
        return {'valid': False, 'reason': 'User mismatch'}

    attempts = session.get('login_attempts') or 0
    if attempts >= MAX_LOGIN_ATTEMPTS:
        return {'valid': False, 'reason': 'Too many attempts'}

    return {'valid': True, 'user_id': session.get('user_id')}

def generate_token(length):
    chars = string.ascii_letters + string.digits
    token = ''
    for i in range(length):
        token += random.choice(chars)
    return token

def hash_password(password, salt=None):
    try:
        import hashlib
        if salt is None:
            salt = generate_token(16)
        hashed = hashlib.sha256((password + salt).encode()).hexdigest()
        return hashed + ':' + salt
    except Exception as e:
        return None`,
        tradeoffs: {
          pros: ["Fixes all is None checks and bare except", "Descriptive names make auth logic reviewable", "Minimal diff — safe for security-sensitive code"],
          cons: ["generate_token still uses a loop instead of ''.join(random.choices(...))"]
        },
        rulesApplied: ["rule-py-002", "rule-py-004", "rule-006"],
        teamAlignment: "Minimal and safe for auth code. Bob's pattern: fix correctness first, style in a follow-up PR."
      },
      {
        id: "option-2",
        title: "Modern Python + secrets module",
        description: "Use secrets.token_urlsafe() for cryptographic token generation, walrus operator for cleaner checks.",
        approach: "moderate",
        code: `# auth/validator.py  — Bob Martinez
import time
import secrets
import hashlib

SESSION_TIMEOUT = 3600
MAX_LOGIN_ATTEMPTS = 5

def validate_session(session, user):
    if not session:
        return {'valid': False, 'reason': 'No session'}

    age = time.time() - session.get('created_at', 0)

    if age > SESSION_TIMEOUT:
        return {'valid': False, 'reason': 'Session expired'}

    if session.get('user_id') != user.get('id'):
        return {'valid': False, 'reason': 'User mismatch'}

    if (session.get('login_attempts') or 0) >= MAX_LOGIN_ATTEMPTS:
        return {'valid': False, 'reason': 'Too many attempts'}

    return {'valid': True, 'user_id': session.get('user_id')}

def generate_token(length=32):
    return secrets.token_urlsafe(length)

def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{hashed}:{salt}"`,
        tradeoffs: {
          pros: ["secrets module is cryptographically secure (random module is NOT safe for auth)", "Removes bare except — hash_password can now propagate real errors", "Cleaner and shorter"],
          cons: ["secrets.token_urlsafe returns URL-safe base64, not alphanumeric — verify callers that validate token format"]
        },
        rulesApplied: ["rule-py-002", "rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "Critical improvement: using random for tokens is a security vulnerability. Eve Patel raised this in the last security review."
      },
      {
        id: "option-3",
        title: "Typed + Named Error Codes",
        description: "Type annotations, dataclass for ValidationResult, named error constants. Matches team's move toward typed Python.",
        approach: "aggressive",
        code: `# auth/validator.py  — Bob Martinez
import time
import secrets
import hashlib
from dataclasses import dataclass
from typing import Optional
from enum import Enum

SESSION_TIMEOUT = 3600
MAX_LOGIN_ATTEMPTS = 5

class AuthError(str, Enum):
    NO_SESSION = 'NO_SESSION'
    EXPIRED = 'SESSION_EXPIRED'
    USER_MISMATCH = 'USER_MISMATCH'
    TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS'

@dataclass
class ValidationResult:
    valid: bool
    user_id: Optional[str] = None
    error: Optional[AuthError] = None

def validate_session(session: Optional[dict], user: dict) -> ValidationResult:
    if not session:
        return ValidationResult(valid=False, error=AuthError.NO_SESSION)
    if time.time() - session.get('created_at', 0) > SESSION_TIMEOUT:
        return ValidationResult(valid=False, error=AuthError.EXPIRED)
    if session.get('user_id') != user.get('id'):
        return ValidationResult(valid=False, error=AuthError.USER_MISMATCH)
    if (session.get('login_attempts') or 0) >= MAX_LOGIN_ATTEMPTS:
        return ValidationResult(valid=False, error=AuthError.TOO_MANY_ATTEMPTS)
    return ValidationResult(valid=True, user_id=session.get('user_id'))

def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)`,
        tradeoffs: {
          pros: ["Enum error codes prevent typo bugs in callers", "ValidationResult dataclass makes return type inspectable", "Type annotations enable mypy"],
          cons: ["Callers checking result['reason'] string will break — needs coordinated update", "Enum requires Python 3.4+"]
        },
        rulesApplied: ["rule-py-002", "rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "Eve Patel proposed this typed pattern in last sprint's architecture review. Coordinate with the auth middleware team before merging."
      }
    ]
  },

  "Carol Liu": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Fix is None checks, mutable default arg in update_user, and rename the single-letter loop variable.",
        approach: "conservative",
        code: `# api/user_service.py  — Carol Liu
def get_user_profile(user_id, db):
    user = None
    for item in db:
        if item.get('id') == user_id:
            user = item
            break

    if user is None:
        return None

    profile = {
        'id': user.get('id'),
        'name': user.get('name'),
        'email': user.get('email'),
    }

    settings = user.get('settings')
    if settings is not None and settings.get('theme') is not None:
        profile['theme'] = settings.get('theme')
    else:
        profile['theme'] = 'light'

    org = user.get('org')
    if org is not None and org.get('team') is not None:
        profile['team'] = org.get('team', {}).get('name')

    prefs = user.get('preferences')
    if prefs is not None:
        if prefs.get('notifications') is not None:
            profile['notifications'] = prefs.get('notifications')
        if prefs.get('language') is not None:
            profile['language'] = prefs.get('language')

    return profile

def update_user(user_id, db, updates=None):
    if updates is None:
        updates = {}
    for item in db:
        if item.get('id') == user_id:
            item.update(updates)
            return item
    return None`,
        tradeoffs: {
          pros: ["Fixes all is None violations", "Fixes mutable default arg in update_user", "Safe minimal change"],
          cons: ["Still 35 lines of nested checks — readability not improved"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004"],
        teamAlignment: "Safe for a quick fix before Carol's optional chaining refactor."
      },
      {
        id: "option-2",
        title: "dict.get() with Defaults (Recommended)",
        description: "Collapse nested None checks using .get() defaults and next() for the db lookup. 35 lines → 18 lines.",
        approach: "moderate",
        code: `# api/user_service.py  — Carol Liu
def get_user_profile(user_id, db):
    user = next((item for item in db if item.get('id') == user_id), None)
    if user is None:
        return None

    settings = user.get('settings') or {}
    org_team = (user.get('org') or {}).get('team') or {}
    prefs = user.get('preferences') or {}

    return {
        'id': user.get('id'),
        'name': user.get('name'),
        'email': user.get('email'),
        'theme': settings.get('theme', 'light'),
        'team': org_team.get('name'),
        'notifications': prefs.get('notifications'),
        'language': prefs.get('language'),
    }

def update_user(user_id, db, updates=None):
    user = next((item for item in db if item.get('id') == user_id), None)
    if user is not None:
        user.update(updates or {})
    return user`,
        tradeoffs: {
          pros: ["35 lines → 18 lines with identical behavior", "next() with default is the Pythonic db-lookup pattern", ".get(key, default) eliminates all explicit None checks"],
          cons: ["(x or {}) pattern returns empty dict for falsy values — verify no fields are intentionally 0 or False"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "This is the pattern Carol introduced in her optional chaining PR. Bob Martinez reviewed and approved it."
      },
      {
        id: "option-3",
        title: "Type-Annotated Service",
        description: "TypedDict for UserProfile, type annotations, and a proper None-safe deep-get helper.",
        approach: "aggressive",
        code: `# api/user_service.py  — Carol Liu
from typing import Optional, TypedDict

class UserProfile(TypedDict, total=False):
    id: str
    name: str
    email: str
    theme: str
    team: Optional[str]
    notifications: Optional[bool]
    language: Optional[str]

def _deep_get(obj: dict, *keys, default=None):
    for key in keys:
        if not isinstance(obj, dict):
            return default
        obj = obj.get(key)
    return obj if obj is not None else default

def get_user_profile(user_id: str, db: list) -> Optional[UserProfile]:
    user = next((u for u in db if u.get('id') == user_id), None)
    if user is None:
        return None
    return {
        'id': user.get('id'),
        'name': user.get('name'),
        'email': user.get('email'),
        'theme': _deep_get(user, 'settings', 'theme', default='light'),
        'team': _deep_get(user, 'org', 'team', 'name'),
        'notifications': _deep_get(user, 'preferences', 'notifications'),
        'language': _deep_get(user, 'preferences', 'language'),
    }

def update_user(user_id: str, db: list, updates: Optional[dict] = None) -> Optional[dict]:
    user = next((u for u in db if u.get('id') == user_id), None)
    if user is not None:
        user.update(updates or {})
    return user`,
        tradeoffs: {
          pros: ["TypedDict enables IDE autocomplete for callers", "_deep_get eliminates all nested access patterns", "Type annotations enable mypy static analysis"],
          cons: ["TypedDict requires Python 3.8+", "_deep_get is a new shared utility — move to utils/helpers.py if used in 2+ files"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "Eve Patel proposed TypedDict for API responses in the architecture review. Coordinate with Carol on _deep_get placement."
      }
    ]
  },

  "David Kim": {
    options: [
      {
        id: "option-1",
        title: "Rename Only",
        description: "Rename cryptic single-letter functions and variables. No structural changes — purely cosmetic.",
        approach: "conservative",
        code: `# utils/helpers.py  — David Kim
def sum_field(items, field_name, return_average=False):
    total = 0
    for item in items:
        if item is not None and item.get(field_name) is not None:
            total += item.get(field_name)
    if return_average:
        return total / len(items)
    return total

def filter_by_value(data, key, value):
    result = []
    for item in data:
        try:
            if item[key] == value:
                result.append(item)
        except (KeyError, TypeError):
            pass
    return result

def sort_by_key(array, key, order='asc'):
    result = list(array)
    try:
        result.sort(key=lambda x: x.get(key) if x.get(key) is not None else '',
                    reverse=(order == 'desc'))
    except (TypeError, AttributeError):
        pass
    return result

def deep_get(data, key_path, default=None):
    try:
        keys = key_path.split('.')
        value = data
        for k in keys:
            if value is None:
                return default
            value = value.get(k)
        return value if value is not None else default
    except (AttributeError, TypeError):
        return default`,
        tradeoffs: {
          pros: ["Pure rename — zero behavior change", "Functions are now searchable in the codebase", "Specific exception catches instead of bare except"],
          cons: ["Still uses loops instead of comprehensions"]
        },
        rulesApplied: ["rule-py-002", "rule-py-004", "rule-006"],
        teamAlignment: "David Kim's own pattern: rename first, refactor structure in a follow-up PR."
      },
      {
        id: "option-2",
        title: "Pythonic Comprehensions",
        description: "Replace all loops with list comprehensions and built-in sorted(). Standard Python idiom.",
        approach: "moderate",
        code: `# utils/helpers.py  — David Kim
def sum_field(items, field_name, return_average=False):
    values = [item[field_name] for item in items
              if item is not None and item.get(field_name) is not None]
    total = sum(values)
    return total / len(items) if return_average and items else total

def filter_by_value(data, key, value):
    return [item for item in data if item.get(key) == value]

def sort_by_key(array, key, order='asc'):
    return sorted(
        array,
        key=lambda x: x.get(key) or '',
        reverse=(order == 'desc')
    )

def deep_get(data, key_path, default=None):
    keys = key_path.split('.')
    value = data
    for k in keys:
        if not isinstance(value, dict):
            return default
        value = value.get(k)
    return value if value is not None else default`,
        tradeoffs: {
          pros: ["filter_by_value: 8 lines → 1 line", "sorted() returns a new list (no mutation)", "Pythonic and PEP 8 compliant"],
          cons: ["filter_by_value uses .get() (returns None for missing key) vs original dict[key] — slightly different for non-dict items"]
        },
        rulesApplied: ["rule-py-002", "rule-py-004", "rule-006"],
        teamAlignment: "Alice Chen uses this comprehension style in the pipeline module. Carol Liu approved it in her last review."
      },
      {
        id: "option-3",
        title: "Type-Annotated Utility Module",
        description: "Full type annotations, edge case handling, and docstrings. Ready to package as a shared module.",
        approach: "aggressive",
        code: `# utils/helpers.py  — David Kim
from typing import Any, Optional

def sum_field(items: list, field_name: str, return_average: bool = False) -> float:
    """Sum a numeric field across a list of dicts. Skips None values."""
    if not items:
        return 0
    values = [item[field_name] for item in items
              if isinstance(item, dict) and item.get(field_name) is not None]
    total = sum(values)
    return total / len(items) if return_average else total

def filter_by_value(data: list, key: str, value: Any) -> list:
    """Return items where item[key] == value. Strict equality."""
    return [item for item in data if isinstance(item, dict) and item.get(key) == value]

def sort_by_key(array: list, key: str, order: str = 'asc') -> list:
    """Return a new sorted list. Non-comparable values sort last."""
    return sorted(
        array,
        key=lambda x: (x.get(key) is None, x.get(key) or ''),
        reverse=(order == 'desc')
    )

def deep_get(data: Any, key_path: str, default: Any = None) -> Any:
    """Safely traverse nested dicts with dot-notation path."""
    value = data
    for key in key_path.split('.'):
        if not isinstance(value, dict):
            return default
        value = value.get(key)
    return value if value is not None else default`,
        tradeoffs: {
          pros: ["Docstrings document behavior for future maintainers", "sort_by_key puts None values last (not first) — more useful default", "Type annotations enable mypy"],
          cons: ["Docstring maintenance overhead", "Best justified if module is shared across 3+ other files"]
        },
        rulesApplied: ["rule-py-002", "rule-py-004", "rule-006"],
        teamAlignment: "Recommend if David's utils module is imported widely. Check with Eve Patel who uses similar helpers in config/."
      }
    ]
  },

  "Eve Patel": {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: "Fix is None checks, mutable default args, rename single-letter params. No structural changes.",
        approach: "conservative",
        code: `# config/pricing.py  — Eve Patel
def calculate_price(quantity, tier, discount_percent=None):
    price = 0

    if tier == 'premium':
        price = quantity * 29.99
    elif tier == 'standard':
        price = quantity * 14.99
    else:
        price = quantity * 9.99

    if quantity > 100:
        price = price * 0.85
    elif quantity > 50:
        price = price * 0.90
    elif quantity > 10:
        price = price * 0.95

    if discount_percent is not None and discount_percent > 0:
        price = price - (price * discount_percent / 100)

    tax = price * 0.08875
    return round(price + tax, 2)

def get_tier_config(tiers=None):
    if tiers is None:
        tiers = []
    result = {}
    for tier in tiers:
        if tier.get('name') is not None:
            result[tier['name']] = tier
    return result

def apply_promo(price, code, promos=None):
    if promos is None:
        promos = {}
    try:
        if promos.get(code) is not None:
            discount = promos[code]
            return price * (1 - discount / 100)
        return price
    except (TypeError, KeyError):
        return price`,
        tradeoffs: {
          pros: ["Fixes all is None and mutable default arg violations", "Descriptive names make pricing logic readable", "Minimal change — safe to merge"],
          cons: ["Magic numbers 29.99, 0.85, 0.08875 still in logic body"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "Eve's own pattern: fix correctness first, extract constants in a follow-up PR."
      },
      {
        id: "option-2",
        title: "Named Constants (Recommended)",
        description: "Extract all magic numbers to named constants. Matches Eve's recent 'extract magic numbers' commit exactly.",
        approach: "moderate",
        code: `# config/pricing.py  — Eve Patel
TIER_PRICES = {
    'premium':  29.99,
    'standard': 14.99,
    'basic':     9.99,
}

VOLUME_DISCOUNTS = [
    {'min_qty': 100, 'multiplier': 0.85},
    {'min_qty': 50,  'multiplier': 0.90},
    {'min_qty': 10,  'multiplier': 0.95},
]

TAX_RATE = 0.08875

def calculate_price(quantity, tier, discount_percent=None):
    unit_price = TIER_PRICES.get(tier, TIER_PRICES['basic'])
    price = quantity * unit_price

    volume = next((d for d in VOLUME_DISCOUNTS if quantity > d['min_qty']), None)
    if volume is not None:
        price *= volume['multiplier']

    if discount_percent is not None and discount_percent > 0:
        price *= (1 - discount_percent / 100)

    return round(price * (1 + TAX_RATE), 2)

def get_tier_config(tiers=None):
    return {t['name']: t for t in (tiers or []) if t.get('name') is not None}

def apply_promo(price, code, promos=None):
    if not promos:
        return price
    discount = (promos or {}).get(code)
    return price * (1 - discount / 100) if discount is not None else price`,
        tradeoffs: {
          pros: ["Price changes require editing one constant, not hunting through logic", "next() with default is Pythonic for finding first matching discount tier", "TAX_RATE is searchable and documentable", "Passes all lint checks"],
          cons: ["VOLUME_DISCOUNTS order matters — must be highest threshold first"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004", "rule-004", "rule-006"],
        teamAlignment: "This is exactly the pattern Eve applied in her recent commit. David Kim and Alice Chen have both reviewed and approved this style."
      },
      {
        id: "option-3",
        title: "Config-Driven Pricing",
        description: "Fully data-driven — pricing rules in a config dataclass that can be loaded from a database or feature flag system.",
        approach: "aggressive",
        code: `# config/pricing.py  — Eve Patel
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class VolumeTier:
    threshold: int
    rate: float

@dataclass
class PricingConfig:
    tier_prices: dict = field(default_factory=lambda: {
        'premium':  29.99,
        'standard': 14.99,
        'basic':     9.99,
    })
    volume_discounts: list = field(default_factory=lambda: [
        VolumeTier(threshold=100, rate=0.15),
        VolumeTier(threshold=50,  rate=0.10),
        VolumeTier(threshold=10,  rate=0.05),
    ])
    tax_rate: float = 0.08875

_config = PricingConfig()

def calculate_price(quantity: int, tier: str,
                    discount_percent: Optional[float] = None,
                    config: PricingConfig = _config) -> float:
    unit_price = config.tier_prices.get(tier, config.tier_prices['basic'])
    price = quantity * unit_price

    vol = next((d for d in config.volume_discounts if quantity > d.threshold), None)
    if vol is not None:
        price *= (1 - vol.rate)

    if discount_percent is not None and discount_percent > 0:
        price *= (1 - discount_percent / 100)

    return round(price * (1 + config.tax_rate), 2)`,
        tradeoffs: {
          pros: ["PricingConfig can be injected — easy to test with different price sets", "Discount rates expressed as 0.15 (15%) instead of multiplier 0.85 — more intuitive", "Type annotations enable mypy"],
          cons: ["Largest structural change — best if pricing will come from an external config store", "VolumeTier dataclass means callers can't pass plain dicts"]
        },
        rulesApplied: ["rule-py-003", "rule-py-004", "rule-004", "rule-006"],
        teamAlignment: "Eve mentioned moving pricing to a config service in last week's architecture meeting. This sets up that migration path."
      }
    ]
  }
};

function buildMockRefactorOptions(code, language, engineer) {
  // Return engineer + language specific options if available
  if (language === "python" && engineer && PYTHON_REFACTOR_OPTIONS[engineer]) {
    return PYTHON_REFACTOR_OPTIONS[engineer];
  }
  if (language !== "python" && engineer && REFACTOR_OPTIONS[engineer]) {
    return REFACTOR_OPTIONS[engineer];
  }

  // Generic fallback for custom/pasted code
  const fixed = language === "python"
    ? code
        .replace(/== None/g, "is None")
        .replace(/!= None/g, "is not None")
        .replace(/\bexcept\s*:/g, "except Exception:")
    : code
        .replace(/\bvar\b/g, "const")
        .replace(/([^!=])!=\s*null/g, "$1!== null")
        .replace(/([^!=])==\s*null/g, "$1=== null");

  const isJS = language !== "python";
  return {
    options: [
      {
        id: "option-1",
        title: "Minimal Fix",
        description: isJS
          ? "Replace var with const/let and fix loose equality operators. Smallest possible diff."
          : "Fix is None checks, mutable default args, and bare except clauses.",
        approach: "conservative",
        code: fixed,
        tradeoffs: {
          pros: ["Smallest diff — easy to review", "Fixes critical lint errors"],
          cons: ["May still have stylistic warnings"]
        },
        rulesApplied: isJS ? ["rule-001", "rule-002"] : ["rule-py-002", "rule-py-003", "rule-py-004"],
        teamAlignment: "Safe for hotfixes and legacy code areas."
      },
      {
        id: "option-2",
        title: isJS ? "ES6+ Modernization" : "Pythonic Style",
        description: isJS
          ? "Replace for-loops with functional array methods, use arrow functions and optional chaining."
          : "Replace loops with comprehensions, use built-in functions, idiomatic Python.",
        approach: "moderate",
        code: fixed,
        tradeoffs: {
          pros: ["More readable and team-standard", "Passes all lint rules"],
          cons: ["Larger diff — requires thorough review"]
        },
        rulesApplied: isJS
          ? ["rule-001", "rule-002", "rule-005", "rule-006"]
          : ["rule-py-002", "rule-py-003", "rule-py-004"],
        teamAlignment: "Matches the team's current modernization effort."
      },
      {
        id: "option-3",
        title: isJS ? "Fully Idiomatic" : "Type-Annotated",
        description: isJS
          ? "Full rewrite using modern patterns: functional methods, optional chaining, named constants, JSDoc."
          : "Add type annotations, docstrings, and input validation. Production-ready.",
        approach: "aggressive",
        code: fixed,
        tradeoffs: {
          pros: ["Production-quality", "Zero lint warnings", "Self-documenting"],
          cons: ["Largest change — best for new code, not hotfixes"]
        },
        rulesApplied: isJS
          ? ["rule-001", "rule-002", "rule-003", "rule-005", "rule-006", "rule-007"]
          : ["rule-py-002", "rule-py-003", "rule-py-004", "rule-006"],
        teamAlignment: "Best for shared utilities and new feature work."
      }
    ]
  };
}

module.exports = { buildMockAnalysis, buildMockRefactorOptions };
