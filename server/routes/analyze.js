const express = require("express");
const router = express.Router();
const { analyzeJS, analyzePython } = require("../astAnalyzer");
const { callLLM } = require("../llm");
const teamContext = require("../teamContext");
const { buildMockAnalysis } = require("../mockResponses");

router.post("/", async (req, res) => {
  try {
    const { code, language = "javascript", engineer = "Anonymous" } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: "No code provided" });
    }

    // Step 1: Static AST analysis
    const staticIssues = language === "python" ? analyzePython(code) : analyzeJS(code);

    // Step 2: Map static issues to team lint rules
    const teamViolations = staticIssues
      .map(issue => {
        const rule = teamContext.lintRules.find(r => r.id === issue.ruleId);
        return rule ? { ...issue, ruleName: rule.name, ruleRationale: rule.rationale } : issue;
      })
      .filter(Boolean);

    // Step 3: Find pattern matches from recent team commits
    const patternMatches = [];
    for (const [patternName, stat] of Object.entries(teamContext.patternStats)) {
      if (
        (patternName.includes("var") && staticIssues.some(i => i.type === "no-var")) ||
        (patternName.includes("for-loop") && staticIssues.some(i => i.type === "prefer-array-methods")) ||
        (patternName.includes("loose equality") && staticIssues.some(i => i.type === "eqeqeq"))
      ) {
        patternMatches.push({
          pattern: patternName,
          otherEngineers: stat.engineers.filter(e => e !== engineer),
          count: stat.count,
          status: stat.status
        });
      }
    }

    // Step 4: Build diagnosis — via mock or real LLM
    let parsed;

    if (process.env.MOCK_LLM === "true") {
      parsed = buildMockAnalysis(staticIssues, patternMatches, language, engineer);
    } else {
      const systemPrompt = `You are DevMind, an AI code intelligence assistant for software engineering teams.
Your job is to analyze code and explain issues in plain English, referencing team-level context.
Always respond with valid JSON in the exact format requested. Be concise but insightful.`;

      const userPrompt = `Analyze this ${language} code snippet and the static analysis issues found.
Provide team-aware explanations that reference the team's coding standards.

CODE:
\`\`\`${language}
${code}
\`\`\`

STATIC ANALYSIS ISSUES FOUND:
${JSON.stringify(staticIssues, null, 2)}

TEAM CONTEXT:
- Team: ${teamContext.teamName}
- Engineer submitting: ${engineer}
- Pattern matches (same issues found in other engineers' code): ${JSON.stringify(patternMatches, null, 2)}
- Team's relevant lint rules: ${JSON.stringify(teamContext.lintRules.filter(r => staticIssues.some(i => i.ruleId === r.id)), null, 2)}
- Recent refactor pattern in team commits: ${teamContext.recentCommits.slice(0, 3).map(c => c.message).join("; ")}

Respond with JSON in this EXACT format:
{
  "summary": "2-3 sentence plain-English summary of what's wrong with this code and why it matters for the team",
  "issues": [
    {
      "type": "issue type",
      "severity": "error|warning|info",
      "line": <line number>,
      "title": "Short title",
      "explanation": "Plain-English explanation of why this is problematic",
      "teamContext": "How this relates to the team's standards or other engineers' patterns",
      "ruleId": "rule id if applicable"
    }
  ],
  "overallSeverity": "critical|high|medium|low",
  "teamImpact": "Brief note on how this pattern affects the broader team (code review time, merge conflicts, etc.)"
}`;

      const llmResponse = await callLLM(systemPrompt, userPrompt);

      try {
        const jsonMatch = llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
                          llmResponse.match(/```\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
        parsed = JSON.parse(jsonStr.trim());
      } catch (e) {
        // Fallback to mock if LLM response can't be parsed
        parsed = buildMockAnalysis(staticIssues, patternMatches, language, engineer);
      }
    }

    res.json({
      ...parsed,
      staticIssues,
      teamViolations,
      patternMatches,
      analyzedAt: new Date().toISOString(),
      engineer,
      mock: process.env.MOCK_LLM === "true"
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

module.exports = router;
