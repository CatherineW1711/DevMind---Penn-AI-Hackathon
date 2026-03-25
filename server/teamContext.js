// Simulated team context — in a real system this would come from
// a database, git history analysis, and lint config files.

const teamContext = {
  teamName: "Platform Engineering",
  engineers: ["Alice Chen", "Bob Martinez", "Carol Liu", "David Kim", "Eve Patel"],

  lintRules: [
    {
      id: "rule-001",
      name: "no-var",
      severity: "error",
      description: "Use 'const' or 'let' instead of 'var'",
      rationale: "var has function scope and hoisting behavior that leads to subtle bugs"
    },
    {
      id: "rule-002",
      name: "eqeqeq",
      severity: "error",
      description: "Use === instead of == or !=",
      rationale: "Strict equality prevents unexpected type coercion"
    },
    {
      id: "rule-003",
      name: "prefer-const",
      severity: "warning",
      description: "Use const for variables that are never reassigned",
      rationale: "Signals intent and prevents accidental reassignment"
    },
    {
      id: "rule-004",
      name: "no-magic-numbers",
      severity: "warning",
      description: "Avoid magic numbers — use named constants",
      rationale: "Named constants are self-documenting and easier to update"
    },
    {
      id: "rule-005",
      name: "prefer-array-methods",
      severity: "warning",
      description: "Use Array.filter(), .map(), .reduce() over manual for loops",
      rationale: "Functional array methods are more readable and team-standard"
    },
    {
      id: "rule-006",
      name: "consistent-naming",
      severity: "error",
      description: "Use descriptive names — avoid single-letter variables except loop counters",
      rationale: "Descriptive names reduce cognitive load during code review"
    },
    {
      id: "rule-007",
      name: "no-loose-null-check",
      severity: "warning",
      description: "Use explicit null/undefined checks or optional chaining",
      rationale: "Loose checks can miss undefined vs null distinctions"
    }
  ],

  recentCommits: [
    {
      hash: "a1b2c3d",
      author: "Alice Chen",
      message: "refactor: replace for-loops with Array.filter in data pipeline",
      timestamp: "2 hours ago",
      pattern: "Functional array methods"
    },
    {
      hash: "e4f5g6h",
      author: "Bob Martinez",
      message: "fix: replace var with const/let across auth module",
      timestamp: "5 hours ago",
      pattern: "ES6+ syntax modernization"
    },
    {
      hash: "i7j8k9l",
      author: "Carol Liu",
      message: "feat: add optional chaining for null-safe property access",
      timestamp: "1 day ago",
      pattern: "Null safety patterns"
    },
    {
      hash: "m0n1o2p",
      author: "David Kim",
      message: "chore: rename single-letter vars in utils/transform.js",
      timestamp: "2 days ago",
      pattern: "Descriptive naming"
    },
    {
      hash: "q3r4s5t",
      author: "Eve Patel",
      message: "refactor: extract magic numbers to named constants",
      timestamp: "3 days ago",
      pattern: "Named constants"
    }
  ],

  libraryPreferences: [
    { category: "Utility", preferred: "lodash", avoid: "underscore", reason: "Team standardized on lodash in Q3 2023" },
    { category: "HTTP Client", preferred: "axios", avoid: "fetch (raw)", reason: "axios provides better error handling and interceptors" },
    { category: "Date handling", preferred: "date-fns", avoid: "moment.js", reason: "moment.js is deprecated; date-fns is tree-shakeable" },
    { category: "Testing", preferred: "Jest + Testing Library", avoid: "Enzyme", reason: "Enzyme lacks React 18 support" },
    { category: "State Management", preferred: "Zustand", avoid: "Redux (for simple state)", reason: "Less boilerplate for our scale" }
  ],

  patternStats: {
    "var usage": { count: 3, engineers: ["Bob Martinez", "David Kim", "Eve Patel"], status: "being phased out" },
    "for-loop instead of array methods": { count: 4, engineers: ["Alice Chen", "Bob Martinez", "Carol Liu", "David Kim"], status: "active refactor" },
    "loose equality (==)": { count: 2, engineers: ["Carol Liu", "Eve Patel"], status: "flagged in last sprint" }
  }
};

module.exports = teamContext;
