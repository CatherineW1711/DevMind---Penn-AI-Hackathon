import React, { useMemo } from "react";

function computeDiff(original, refactored) {
  const oldLines = original.split("\n");
  const newLines = refactored.split("\n");

  // Simple LCS-based diff
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: "unchanged", content: oldLines[i - 1], oldLine: i, newLine: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", content: newLines[j - 1], newLine: j });
      j--;
    } else {
      result.unshift({ type: "removed", content: oldLines[i - 1], oldLine: i });
      i--;
    }
  }
  return result;
}

export default function DiffView({ original, refactored, title }) {
  const diff = useMemo(() => computeDiff(original, refactored), [original, refactored]);

  const added = diff.filter(l => l.type === "added").length;
  const removed = diff.filter(l => l.type === "removed").length;

  return (
    <div className="rounded-lg border border-slate-700/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <span className="text-xs font-semibold text-slate-400">{title || "Diff View"}</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-400 font-mono">+{added}</span>
          <span className="text-red-400 font-mono">-{removed}</span>
        </div>
      </div>

      {/* Diff lines */}
      <div className="overflow-auto max-h-64 bg-slate-900/60">
        <table className="w-full text-xs font-mono border-collapse">
          <tbody>
            {diff.map((line, i) => {
              const isAdded = line.type === "added";
              const isRemoved = line.type === "removed";
              return (
                <tr key={i} className={isAdded ? "diff-added" : isRemoved ? "diff-removed" : "diff-unchanged"}>
                  <td className="w-8 text-right pr-2 py-0.5 text-slate-600 select-none pl-2 border-r border-slate-700/30">
                    {isRemoved ? line.oldLine : ""}
                  </td>
                  <td className="w-8 text-right pr-2 py-0.5 text-slate-600 select-none border-r border-slate-700/30">
                    {isAdded ? line.newLine : ""}
                  </td>
                  <td className="w-5 text-center py-0.5 select-none">
                    {isAdded ? <span className="text-green-500">+</span> : isRemoved ? <span className="text-red-500">-</span> : <span className="text-slate-700"> </span>}
                  </td>
                  <td className={`py-0.5 pl-1 pr-3 whitespace-pre ${isAdded ? "text-green-300" : isRemoved ? "text-red-300 line-through decoration-red-700/50" : "text-slate-400"}`}>
                    {line.content}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
