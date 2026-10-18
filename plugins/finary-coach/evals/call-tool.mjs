#!/usr/bin/env node
// Calls one tool of the mock Finary MCP over stdio and prints the result, for agents
// or humans that cannot attach an MCP server.
//
//   node call-tool.mjs fixtures/us-china.json holdings
//   node call-tool.mjs fixtures/us-china.json simulate_compound_interest '{"monthly":800,"years":25}'
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [fixture, tool, rawArgs = "{}"] = process.argv.slice(2);
if (!fixture || !tool) {
  console.error("Usage: node call-tool.mjs <fixture.json> <tool> [json-arguments]");
  process.exit(1);
}

const server = spawn(process.execPath, [
  join(dirname(fileURLToPath(import.meta.url)), "mock-finary-mcp.mjs"),
  fixture,
]);
let buffer = "";
server.stdout.on("data", (chunk) => {
  buffer += chunk;
  for (const line of buffer.split("\n").slice(0, -1)) {
    const message = JSON.parse(line);
    if (message.id !== 2) continue;
    console.log(message.result?.content?.[0]?.text ?? JSON.stringify(message.error));
    server.kill();
  }
  buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
});
const send = (message) => server.stdin.write(JSON.stringify(message) + "\n");
send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
send({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: tool, arguments: JSON.parse(rawArgs) } });
