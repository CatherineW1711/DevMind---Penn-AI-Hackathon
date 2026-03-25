import React from "react";

const actionConfig = {
  analyze: { color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/30", icon: "🔍" },
  refactor_generate: { color: "text-violet-400", bg: "bg-violet-900/20 border-violet-700/30", icon: "⚡" },
  refactor_apply: { color: "text-green-400", bg: "bg-green-900/20 border-green-700/30", icon: "✅" },
  rollback: { color: "text-amber-400", bg: "bg-amber-900/20 border-amber-700/30", icon: "↩️" },
  code_change: { color: "text-slate-400", bg: "bg-slate-800/40 border-slate-700/30", icon: "✏️" }
};

export default function AuditLog({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-xs text-slate-600 italic py-2">
        No actions yet — start by analyzing some code.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-48">
      {[...entries].reverse().map((entry, i) => {
        const cfg = actionConfig[entry.action] || actionConfig.code_change;
        return (
          <div key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${cfg.bg}`}>
            <span className="text-sm flex-shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold ${cfg.color}`}>{entry.label}</span>
                <span className="text-xs text-slate-500">by</span>
                <span className="text-xs font-medium text-slate-300">{entry.engineer}</span>
              </div>
              {entry.detail && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.detail}</p>
              )}
            </div>
            <span className="text-xs text-slate-600 flex-shrink-0 font-mono">{entry.timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
