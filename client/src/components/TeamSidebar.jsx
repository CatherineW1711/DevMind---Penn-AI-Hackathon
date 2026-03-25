import React, { useState } from "react";

const tabs = ["Rules", "Commits", "Libraries"];

export default function TeamSidebar({ teamContext }) {
  const [activeTab, setActiveTab] = useState("Rules");

  if (!teamContext) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        Loading team context...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Team Context</span>
        </div>
        <p className="text-xs text-slate-500">{teamContext.teamName}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-3 bg-slate-800/60 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-medium py-1 rounded transition-colors ${
              activeTab === tab
                ? "bg-slate-700 text-slate-200"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Rules" && (
          <div className="flex flex-col gap-2">
            {teamContext.lintRules.map(rule => (
              <div key={rule.id} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold text-violet-300">{rule.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    rule.severity === "error"
                      ? "bg-red-900/50 text-red-300"
                      : "bg-yellow-900/50 text-yellow-300"
                  }`}>
                    {rule.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
                <p className="text-xs text-slate-600 mt-1 italic">{rule.rationale}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Commits" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 mb-1">Last 5 commits from your team</p>
            {teamContext.recentCommits.map(commit => (
              <div key={commit.hash} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{commit.hash}</span>
                  <span className="text-xs text-slate-600">{commit.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{commit.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-5 h-5 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {commit.author.charAt(0)}
                  </div>
                  <span className="text-xs text-slate-500">{commit.author}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/40">
                    {commit.pattern}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Libraries" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 mb-1">Team library standards</p>
            {teamContext.libraryPreferences.map((lib, i) => (
              <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-2.5">
                <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{lib.category}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-semibold text-green-400 bg-green-900/30 border border-green-700/40 px-1.5 py-0.5 rounded">
                    {lib.preferred}
                  </span>
                  <span className="text-xs text-slate-600">preferred</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-red-400/70 bg-red-900/20 border border-red-700/30 px-1.5 py-0.5 rounded line-through">
                    {lib.avoid}
                  </span>
                  <span className="text-xs text-slate-600">avoid</span>
                </div>
                <p className="text-xs text-slate-600 italic">{lib.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineers online */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-600 mb-2">Team members</p>
        <div className="flex flex-wrap gap-1">
          {teamContext.engineers.map((eng, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-slate-400">{eng.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
