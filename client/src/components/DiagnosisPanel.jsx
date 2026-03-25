import React from "react";

const severityConfig = {
  error: { color: "text-red-400", bg: "bg-red-900/30 border-red-700/50", badge: "bg-red-900/60 text-red-300 border-red-600/50", dot: "bg-red-500" },
  warning: { color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-700/50", badge: "bg-yellow-900/60 text-yellow-300 border-yellow-600/50", dot: "bg-yellow-500" },
  info: { color: "text-blue-400", bg: "bg-blue-900/30 border-blue-700/50", badge: "bg-blue-900/60 text-blue-300 border-blue-600/50", dot: "bg-blue-500" }
};

const overallConfig = {
  critical: { label: "CRITICAL", color: "text-red-400", bg: "bg-red-900/40 border-red-500" },
  high: { label: "HIGH", color: "text-orange-400", bg: "bg-orange-900/40 border-orange-500" },
  medium: { label: "MEDIUM", color: "text-yellow-400", bg: "bg-yellow-900/40 border-yellow-500" },
  low: { label: "LOW", color: "text-green-400", bg: "bg-green-900/40 border-green-500" }
};

export default function DiagnosisPanel({ diagnosis, onRefactor, refactoring }) {
  if (!diagnosis) return null;

  const overall = overallConfig[diagnosis.overallSeverity] || overallConfig.medium;

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Diagnosis</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${overall.bg} ${overall.color}`}>
          {overall.label}
        </span>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-slate-700/60 bg-slate-800/60 p-3">
        <p className="text-sm text-slate-300 leading-relaxed">{diagnosis.summary}</p>
        {diagnosis.teamImpact && (
          <div className="mt-2 flex items-start gap-2 text-xs text-violet-300 bg-violet-900/20 border border-violet-700/30 rounded px-2 py-1.5">
            <span className="mt-0.5">🏢</span>
            <span>{diagnosis.teamImpact}</span>
          </div>
        )}
      </div>

      {/* Pattern matches from other engineers */}
      {diagnosis.patternMatches && diagnosis.patternMatches.length > 0 && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-900/15 p-3">
          <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Team Pattern Alert</p>
          {diagnosis.patternMatches.map((match, i) => (
            <div key={i} className="text-xs text-amber-200/80 mb-1">
              <span className="font-medium text-amber-300">{match.count} engineer{match.count > 1 ? "s" : ""}</span> also wrote "{match.pattern}" — {match.status}.
              {match.otherEngineers.length > 0 && (
                <span className="text-amber-400/60"> ({match.otherEngineers.join(", ")})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Issues list */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {diagnosis.issues?.length || 0} Issue{(diagnosis.issues?.length || 0) !== 1 ? "s" : ""} Found
        </p>
        {(diagnosis.issues || []).map((issue, i) => {
          const cfg = severityConfig[issue.severity] || severityConfig.warning;
          return (
            <div key={i} className={`rounded-lg border p-3 ${cfg.bg}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />
                  <span className={`text-xs font-semibold ${cfg.color}`}>{issue.title || issue.type}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {issue.line && (
                    <span className="text-xs font-mono text-slate-500">L{issue.line}</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${cfg.badge}`}>
                    {issue.severity}
                  </span>
                  {issue.ruleId && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/40 font-mono">
                      {issue.ruleId}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-1.5">{issue.explanation}</p>
              {issue.teamContext && (
                <p className="text-xs text-slate-500 italic border-t border-slate-700/40 pt-1.5 mt-1.5">
                  {issue.teamContext}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Refactor CTA */}
      <button
        onClick={onRefactor}
        disabled={refactoring}
        className="mt-1 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
      >
        {refactoring ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating Options...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Auto-Refactor
          </>
        )}
      </button>
    </div>
  );
}
