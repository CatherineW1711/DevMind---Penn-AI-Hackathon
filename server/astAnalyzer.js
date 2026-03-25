const acorn = require("acorn");

/**
 * Runs static AST analysis on JavaScript code.
 * Returns a list of detected issues with line numbers.
 */
function analyzeJS(code) {
  const issues = [];

  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "module",
      locations: true,
      tolerant: true
    });
  } catch (err) {
    // If parse fails, return a parse error
    return [{ type: "parse_error", message: `Syntax error: ${err.message}`, line: err.loc?.line || 1, severity: "error" }];
  }

  // Walk AST nodes recursively
  function walk(node) {
    if (!node || typeof node !== "object") return;

    switch (node.type) {
      case "VariableDeclaration":
        if (node.kind === "var") {
          issues.push({
            type: "no-var",
            ruleId: "rule-001",
            message: `'var' declaration at line ${node.loc.start.line} — use 'const' or 'let' instead`,
            line: node.loc.start.line,
            severity: "error"
          });
        }
        break;

      case "BinaryExpression":
      case "AssignmentExpression":
        if (node.operator === "==" || node.operator === "!=") {
          issues.push({
            type: "eqeqeq",
            ruleId: "rule-002",
            message: `Loose equality '${node.operator}' at line ${node.loc.start.line} — use '${node.operator}=' instead`,
            line: node.loc.start.line,
            severity: "error"
          });
        }
        break;

      case "ForStatement":
        // Check if a for-loop could be replaced by a functional array method
        if (node.body && node.body.type === "BlockStatement") {
          const bodyStatements = node.body.body || [];
          const hasArrayPush = bodyStatements.some(
            s =>
              s.type === "ExpressionStatement" &&
              s.expression?.type === "CallExpression" &&
              s.expression?.callee?.property?.name === "push"
          );
          if (hasArrayPush) {
            issues.push({
              type: "prefer-array-methods",
              ruleId: "rule-005",
              message: `for-loop with .push() at line ${node.loc.start.line} — consider Array.filter() or .map()`,
              line: node.loc.start.line,
              severity: "warning"
            });
          } else {
            issues.push({
              type: "prefer-array-methods",
              ruleId: "rule-005",
              message: `Manual for-loop at line ${node.loc.start.line} — consider functional array methods`,
              line: node.loc.start.line,
              severity: "warning"
            });
          }
        }
        break;

      case "Identifier":
        // Flag single-letter identifiers (excluding 'i', 'j', 'k' in for loops handled separately)
        if (/^[a-z]$/.test(node.name) && node.name !== "i" && node.name !== "j" && node.name !== "k" && node.name !== "e") {
          // Only flag in certain positions — avoid over-flagging
          issues.push({
            type: "consistent-naming",
            ruleId: "rule-006",
            message: `Single-letter variable '${node.name}' at line ${node.loc.start.line} — use a descriptive name`,
            line: node.loc.start.line,
            severity: "error"
          });
        }
        break;

      case "IfStatement":
        // Check for loose null checks: if (x != null) or if (x == null)
        if (
          node.test?.type === "BinaryExpression" &&
          (node.test.operator === "!=" || node.test.operator === "==") &&
          (node.test.right?.value === null || node.test.right?.type === "Literal")
        ) {
          issues.push({
            type: "no-loose-null-check",
            ruleId: "rule-007",
            message: `Loose null check at line ${node.loc.start.line} — use !== null or optional chaining`,
            line: node.loc.start.line,
            severity: "warning"
          });
        }
        break;
    }

    // Recurse into child nodes
    for (const key of Object.keys(node)) {
      if (key === "type" || key === "loc" || key === "start" || key === "end") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof child === "object" && child.type) {
        walk(child);
      }
    }
  }

  walk(ast);

  // Deduplicate by line+type
  const seen = new Set();
  return issues.filter(issue => {
    const key = `${issue.type}:${issue.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Basic Python static analysis (regex-based since we can't run ast module in Node).
 */
function analyzePython(code) {
  const issues = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Check for print statements (Python 2 style)
    if (/^print\s+[^(]/.test(trimmed)) {
      issues.push({
        type: "python2-print",
        ruleId: "rule-py-001",
        message: `Python 2 print statement at line ${lineNum} — use print() function`,
        line: lineNum,
        severity: "error"
      });
    }

    // Check for bare except
    if (/^\s*except\s*:/.test(line)) {
      issues.push({
        type: "bare-except",
        ruleId: "rule-py-002",
        message: `Bare 'except:' clause at line ${lineNum} — specify exception type`,
        line: lineNum,
        severity: "warning"
      });
    }

    // Check for mutable default arguments
    if (/def\s+\w+\s*\(.*=\s*[\[\{]/.test(trimmed)) {
      issues.push({
        type: "mutable-default-arg",
        ruleId: "rule-py-003",
        message: `Mutable default argument at line ${lineNum} — use None and initialize inside function`,
        line: lineNum,
        severity: "error"
      });
    }

    // Check for == None instead of 'is None'
    if (/==\s*None/.test(trimmed) || /!=\s*None/.test(trimmed)) {
      issues.push({
        type: "eq-none",
        ruleId: "rule-py-004",
        message: `Use 'is None' / 'is not None' instead of == None at line ${lineNum}`,
        line: lineNum,
        severity: "warning"
      });
    }

    // Check for single-letter variable names (not i, j, k, x, y, n)
    const singleLetterMatch = trimmed.match(/^([a-z])\s*=/);
    if (singleLetterMatch && !["i", "j", "k", "x", "y", "n", "e", "f"].includes(singleLetterMatch[1])) {
      issues.push({
        type: "consistent-naming",
        ruleId: "rule-006",
        message: `Single-letter variable '${singleLetterMatch[1]}' at line ${lineNum} — use a descriptive name`,
        line: lineNum,
        severity: "error"
      });
    }
  });

  return issues;
}

module.exports = { analyzeJS, analyzePython };
