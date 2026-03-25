const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

function getLLMClient() {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set in .env");
    return { provider: "openai", client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) };
  }

  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set in .env");
  return { provider: "anthropic", client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) };
}

async function callLLM(systemPrompt, userPrompt) {
  if (process.env.MOCK_LLM === "true") {
    return JSON.stringify({ _mock: true });
  }

  const { provider, client } = getLLMClient();

  if (provider === "openai") {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    return response.choices[0].message.content;
  }

  // Anthropic
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }]
  });
  return response.content[0].text;
}

module.exports = { callLLM };
