const express = require("express");
const router = express.Router();
const { callLLM } = require("../llm");
const teamContext = require("../teamContext");
const { buildMockRefactorOptions } = require("../mockResponses");

router.post("/", async (req, res) => {
  try {
    const { code, language = "javascript", issues = [], engineer = "Anonymous" } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: "No code provided" });
    }

    let parsed;

    if (process.env.MOCK_LLM === "true") {
      parsed = buildMockRefactorOptions(code, language, engineer);
    } else {
      const systemPrompt = `You are DevMind, a team-aware AI refactoring assistant.
Generate multiple refactor options for code, each aligned to the team's standards.
Always return valid JSON. Each refactor option must contain the COMPLETE refactored code, not partial snippets.`;

      const userPrompt = `Generate exactly 3 refactor options for this ${language} code.
Each option should fix the identified issues but with different approaches/tradeoffs.
The refactored code MUST be complete and runnable — not partial or truncated.

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

ISSUES TO FIX:
${JSON.stringify(issues.slice(0, 10), null, 2)}

TEAM STANDARDS TO APPLY:
- Library preferences: ${teamContext.libraryPreferences.slice(0, 3).map(l => `${l.category}: use ${l.preferred}`).join(", ")}
- Key rules: ${teamContext.lintRules.map(r => r.name).join(", ")}
- Recent team patterns: ${teamContext.recentCommits.slice(0, 2).map(c => c.pattern).join(", ")}

Respond with JSON in this EXACT format:
{
  "options": [
    {
      "id": "option-1",
      "title": "Minimal Fix",
      "description": "What this option does in 1-2 sentences",
      "approach": "conservative|moderate|aggressive",
      "code": "<complete refactored code here>",
      "tradeoffs": {
        "pros": ["pro 1", "pro 2"],
        "cons": ["con 1"]
      },
      "rulesApplied": ["rule-001", "rule-005"],
      "teamAlignment": "How well this aligns with team patterns"
    },
    { "id": "option-2", "title": "Modern ES6+", "approach": "moderate", "code": "...", "tradeoffs": { "pros": [], "cons": [] }, "rulesApplied": [], "teamAlignment": "..." },
    { "id": "option-3", "title": "Fully Idiomatic", "approach": "aggressive", "code": "...", "tradeoffs": { "pros": [], "cons": [] }, "rulesApplied": [], "teamAlignment": "..." }
  ]
}`;

      const llmResponse = await callLLM(systemPrompt, userPrompt);

      try {
        const jsonMatch = llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
                          llmResponse.match(/```\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
        parsed = JSON.parse(jsonStr.trim());
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse LLM response", raw: llmResponse });
      }
    }

    res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
      engineer,
      mock: process.env.MOCK_LLM === "true"
    });
  } catch (err) {
    console.error("Refactor error:", err);
    res.status(500).json({ error: err.message || "Refactor generation failed" });
  }
});

module.exports = router;
