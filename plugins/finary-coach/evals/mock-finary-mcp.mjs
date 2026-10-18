#!/usr/bin/env node
// Dependency-free stdio MCP server exposing the Finary tool names with fixture data,
// so the skill can be evaluated without a real Finary account.
//
//   node mock-finary-mcp.mjs fixtures/beginner.json
//
// Data shapes are illustrative: the real Finary MCP schemas are not published.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error("Usage: node mock-finary-mcp.mjs <fixture.json>");
  process.exit(1);
}
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

const TOOLS = {
  get_me: "Returns the signed-in Finary user.",
  profiles: "Returns the household members tracked in Finary.",
  get_portfolio_overview: "Returns net worth and its breakdown by asset class.",
  accounts: "Returns every connected account with its type and balance.",
  holdings: "Returns investment lines with ISIN, value, fees and breakdowns.",
  get_budget_overview: "Returns monthly income, spending and savings rate.",
  search_spending: "Returns spending by category.",
  goals: "Returns the user's goals.",
  simulate_compound_interest:
    "Projects a portfolio with monthly contributions at a yearly rate.",
};

function simulate({ initial = 0, monthly = 0, rate = 0.06, years = 20 }) {
  const monthlyRate = rate / 12;
  let value = initial;
  for (let month = 0; month < years * 12; month++) {
    value = value * (1 + monthlyRate) + monthly;
  }
  const invested = initial + monthly * years * 12;
  return {
    initial,
    monthly,
    rate,
    years,
    invested,
    projected_value: Math.round(value),
  };
}

function callTool(name, args) {
  if (name === "simulate_compound_interest") return simulate(args ?? {});
  if (!(name in fixture))
    return { error: `No data for ${name} in this account.` };
  return fixture[name];
}

const toolList = Object.entries(TOOLS).map(([name, description]) => ({
  name,
  description,
  inputSchema:
    name === "simulate_compound_interest"
      ? {
          type: "object",
          properties: {
            initial: { type: "number" },
            monthly: { type: "number" },
            rate: { type: "number", description: "Yearly rate, e.g. 0.06" },
            years: { type: "number" },
          },
        }
      : { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
}));

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  const { id, method, params } = JSON.parse(line);
  if (id === undefined) return; // notification
  switch (method) {
    case "initialize":
      return reply(id, {
        protocolVersion: params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "finary-mock", version: "1.0.0" },
      });
    case "tools/list":
      return reply(id, { tools: toolList });
    case "tools/call":
      return reply(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              callTool(params.name, params.arguments),
              null,
              2,
            ),
          },
        ],
      });
    default:
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Unknown method ${method}` },
        }) + "\n",
      );
  }
});
