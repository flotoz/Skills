# Connect the Finary MCP

Official, read-only Finary connector. The user signs in with their Finary
account and clicks **Authorize read-only access**. No API key, no bank
credentials. Show the user only the section for their client.

Labels in **bold** come from Finary's English help. Do not translate them as
if quoting the app: write "the option _Allow AI assistants (MCP)_ (its
wording may differ in your app's language)".

- Server URL: `https://public-api.finary.com/mcp`
- Official guide: <https://help.finary.com/en/articles/16335735>

## Prerequisite (all clients)

In Finary: account menu → **Security** → enable **Allow AI assistants (MCP)**.

## Claude Code

If the `finary-coach` plugin is installed, the server is already declared:
run `/mcp`, select **finary**, authenticate in the browser.

Otherwise:

```bash
claude mcp add --transport http --scope user finary https://public-api.finary.com/mcp
```

Then `/mcp` → **finary** → authenticate. Check it shows as connected.

## Claude.ai / Claude Desktop

1. Open <https://claude.ai/directory/finary-mcp> → **Connect to Claude**.
2. Approve the read-only authorization.
3. Fallback: Settings → Connectors → **Add custom connector**, name `Finary`,
   URL above.
4. Team / Enterprise: an Owner must first allow Finary in Organization
   settings → Connectors.

## ChatGPT

Settings → enable **Developer mode** → Plugins → **+** → name `Finary`, URL
above → **Connect** → approve. Enable Finary in the tools of the conversation.

## Cursor

`~/.cursor/mcp.json`:

```json
{ "mcpServers": { "finary": { "url": "https://public-api.finary.com/mcp" } } }
```

Approve in the browser. Leave API key / client ID empty.

## Codex / Gemini CLI / others

Add a remote HTTP MCP server named `finary` with the URL above, then run the
client's MCP auth command (e.g. `gemini mcp add --scope user --transport http
finary https://public-api.finary.com/mcp` then `/mcp auth finary`).

## Troubleshooting

| Symptom                | Fix                                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| Connected but no tools | Restart the client                                                        |
| Authorization error    | Check the Security toggle, then re-run authorization (not just reconnect) |
| Connection fails       | Disable VPN; make sure the URL starts with `https://`                     |
| Error code `ofid_…`    | Send it to Finary support                                                 |

## Revoke access

Remove the connector in the client, or turn off **Allow AI assistants (MCP)**
in Finary → Security (applies to every client within minutes).
