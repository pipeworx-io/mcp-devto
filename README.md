# mcp-devto

DEV.to MCP — wraps the DEV Community API (free, no auth for public reads)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_articles` | Get trending or recent DEV.to articles, optionally filtered by tag (e.g., "javascript", "react"). Returns title, author, reaction count, comments, reading time, and URL. |
| `search_articles` | Search DEV.to articles by tag with pagination support. Returns title, author, tags, reactions, comments, reading time, and URL for each result. |
| `get_article` | Fetch full article content from DEV.to by ID (e.g., "12345"). Returns title, author, markdown body, tags, reactions, comments, and published date. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "devto": {
      "url": "https://gateway.pipeworx.io/devto/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Devto data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
