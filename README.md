# DevMind — Team AI Code Intelligence

A full-stack demo showcasing team-level AI code analysis, multi-option refactoring with diff views, and team governance tooling. Built for a 15-minute demo.

## Features

- **AI Diagnostic Panel** — paste code, get instant static analysis + LLM-powered plain-English diagnosis with team context ("3 other engineers wrote this same pattern")
- **Multi-Option Auto-Refactor** — 3 refactor options (conservative / moderate / aggressive) with live diff view and one-click apply
- **One-Click Rollback** — instantly restore original code at any time
- **Team Context Sidebar** — lint rules, recent commits, and library preferences your team enforces
- **Audit Log** — every action (analyze, refactor, rollback) logged with engineer name and timestamp

## Quick Start

### 1. Clone and install

```bash
cd DevMind---Penn-AI-Hackathon
npm run install:all
```

### 2. Configure API key

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
# For Anthropic Claude (recommended)
ANTHROPIC_API_KEY=sk-ant-...

# OR for OpenAI
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
```

### 3. Run

```bash
npm start
```

This starts both the backend (port 3001) and frontend (port 3000).

Open [http://localhost:3000](http://localhost:3000).

## Demo Flow

1. The editor pre-loads a messy `getData()` function
2. Select your simulated engineer from the top-right dropdown
3. Click **Analyze Code** — diagnosis card appears with team context
4. Click **Auto-Refactor** — 3 options appear
5. Click any option to expand it, then **View Diff** or **Apply**
6. Click **Rollback** to restore the original
7. Watch the Audit Log at the bottom record every action

## Project Structure

```
├── server/
│   ├── index.js          # Express server (port 3001)
│   ├── llm.js            # Anthropic/OpenAI abstraction
│   ├── astAnalyzer.js    # acorn-based JS AST + Python regex analysis
│   ├── teamContext.js    # Simulated team data (lint rules, commits, libraries)
│   └── routes/
│       ├── analyze.js    # POST /api/analyze
│       └── refactor.js   # POST /api/refactor
└── client/
    ├── src/
    │   ├── App.jsx                  # Main layout + all state
    │   └── components/
    │       ├── DiagnosisPanel.jsx   # Issue cards with team context
    │       ├── RefactorPanel.jsx    # 3 refactor options with tradeoffs
    │       ├── DiffView.jsx         # LCS-based line diff renderer
    │       ├── TeamSidebar.jsx      # Lint rules / commits / libraries tabs
    │       └── AuditLog.jsx         # Timestamped action history
    └── vite.config.js               # Proxies /api/* to port 3001
```

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **LLM**: Anthropic Claude (claude-haiku-4-5) or OpenAI GPT-4o
- **Static Analysis**: acorn (JS AST parser), regex (Python)
- **State**: React useState — no database needed
