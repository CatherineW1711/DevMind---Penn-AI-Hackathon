import React, { useState } from "react";
import DiffView from "./DiffView";

const approachConfig = {
  conservative: { label: "Conservative", color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/40" },
  moderate: { label: "Moderate", color: "text-violet-400", bg: "bg-violet-900/20 border-violet-700/40" },
  aggressive: { label: "Aggressive", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-700/40" }
};

export default function RefactorPanel({ options, originalCode, onApply, onRollback, appliedOption }) {
  const [selected, setSelected] = useState(null);
  const [showDiff, setShowDiff] = useState(null);

  if (!options || options.length === 0) return null;

  const handleApply = (option) => {
    onApply(option);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Refactor Options</h2>
        {appliedOption && (
          <button
            onClick={onRollback}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-700/40 px-2 py-1 rounded transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Rollback
          </button>
        )}
      </div>

      {appliedOption && (
        <div className="flex items-center gap-2 text-xs text-green-300 bg-green-900/20 border border-green-700/40 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span><span className="font-semibold">"{appliedOption.title}"</span> applied to editor. Click Rollback to restore original.</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          const approach = approachConfig[option.approach] || approachConfig.moderate;
          const isApplied = appliedOption?.id === option.id;
          const isShowingDiff = showDiff === option.id;

          return (
            <div
              key={option.id || i}
              onClick={() => setSelected(selected === option.id ? null : option.id)}
              className={`rounded-lg border cursor-pointer transition-all duration-150 ${
                isApplied
                  ? "border-green-600/60 bg-green-900/15"
                  : selected === option.id
                  ? "border-violet-500/60 bg-violet-900/15"
                  : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60"
              }`}
            >
              {/* Option header */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${approach.bg} ${approach.color}`}>
                      {approach.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{option.title}</span>
                    {isApplied && (
                      <span className="text-xs text-green-400 font-medium">Applied</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">Option {i + 1}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{option.description}</p>

                {/* Team alignment */}
                {option.teamAlignment && (
                  <p className="text-xs text-violet-300/70 mt-1 italic">
                    {option.teamAlignment}
                  </p>
                )}

                {/* Tradeoffs — shown when selected */}
                {selected === option.id && option.tradeoffs && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {option.tradeoffs.pros?.length > 0 && (
                      <div className="rounded bg-green-900/20 border border-green-700/30 p-2">
                        <p className="text-xs font-semibold text-green-400 mb-1">Pros</p>
                        {option.tradeoffs.pros.map((p, j) => (
                          <p key={j} className="text-xs text-green-300/80 before:content-['✓_']">{p}</p>
                        ))}
                      </div>
                    )}
                    {option.tradeoffs.cons?.length > 0 && (
                      <div className="rounded bg-red-900/20 border border-red-700/30 p-2">
                        <p className="text-xs font-semibold text-red-400 mb-1">Cons</p>
                        {option.tradeoffs.cons.map((c, j) => (
                          <p key={j} className="text-xs text-red-300/80 before:content-['✗_']">{c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rules applied */}
                {selected === option.id && option.rulesApplied?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {option.rulesApplied.map(rule => (
                      <span key={rule} className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/40 font-mono">
                        {rule}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {selected === option.id && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDiff(isShowingDiff ? null : option.id); }}
                      className="flex-1 text-xs py-1.5 rounded border border-slate-600/50 text-slate-300 hover:bg-slate-700/40 transition-colors font-medium"
                    >
                      {isShowingDiff ? "Hide Diff" : "View Diff"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(option); }}
                      disabled={isApplied}
                      className="flex-1 text-xs py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                    >
                      {isApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Diff view */}
              {isShowingDiff && option.code && (
                <div className="px-3 pb-3" onClick={e => e.stopPropagation()}>
                  <DiffView
                    original={originalCode}
                    refactored={option.code}
                    title={`${option.title} — Diff`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
