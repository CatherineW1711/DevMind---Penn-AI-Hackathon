require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./routes/analyze");
const refactorRouter = require("./routes/refactor");
const teamContext = require("./teamContext");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/refactor", refactorRouter);

// Team context endpoint (static data)
app.get("/api/team-context", (req, res) => {
  res.json(teamContext);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: process.env.LLM_PROVIDER || "anthropic",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`DevMind server running on http://localhost:${PORT}`);
  console.log(`LLM Provider: ${process.env.LLM_PROVIDER || "anthropic"}`);
});
