# freee-mcp-core

Library-form fork of [freee/freee-mcp](https://github.com/freee/freee-mcp). Exposes the MCP server framework, freee API client, OpenAPI schema loader, and skill resources as npm library exports for use as a dependency, while preserving upstream CLI binary compatibility.

This package is a community fork. It is not maintained by freee K.K. The upstream `freee-mcp` package ships only CLI binaries with no `main`/`module`/`exports` field, so its internals cannot be imported. `freee-mcp-core` adds an `exports` map so downstream projects can wrap, extend, or compose freee-mcp's MCP tools without forking the entire repository.

## Installation

```bash
npm install freee-mcp-core
```

Requires Node.js 22+.

## When to use

Use `freee-mcp-core` if you want to:

- Build a domain-specific MCP server on top of freee API plumbing (e.g., accounting auditing, custom workflow tools, logic solvers)
- Add your own MCP tools alongside the standard freee tools without maintaining a fork
- Reuse freee-mcp's authenticated API client (`makeApiRequest`) in non-MCP contexts
- Bundle the freee-api skill content via MCP resources for universal client compatibility

If you only want the CLI binary (no library use), the upstream [`freee-mcp`](https://www.npmjs.com/package/freee-mcp) is the canonical choice.

## Library Usage

### Minimal MCP server

```ts
import {
  createMcpServer,
  loadConfig,
  initLogger,
  initUserAgentTransportMode,
} from 'freee-mcp-core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

initUserAgentTransportMode('stdio');
initLogger({ transportMode: 'stdio' });

const config = await loadConfig();
const server = createMcpServer(config);

const transport = new StdioServerTransport();
await server.connect(transport);
```

This produces a server identical to the upstream `freee-mcp` CLI: standard freee API tools, OAuth handling, file upload, and bundled skill resources.

### Adding your own tools

```ts
import { createMcpServer, loadConfig } from 'freee-mcp-core';

const server = createMcpServer(await loadConfig());

server.registerTool(
  'my_custom_tool',
  { description: '...', inputSchema: { ... } },
  async (args) => { /* ... */ },
);
```

### Adding your own skill resources

```ts
import {
  createMcpServer,
  registerSkillResources,
  loadConfig,
} from 'freee-mcp-core';

const server = createMcpServer(await loadConfig());
// Core's bundled freee-api-skill is auto-registered.
// Register your additional skills:
registerSkillResources(server, { skillsDir: './my-skills' });
```

### Skipping bundled skills

```ts
const server = createMcpServer(config, { skipBundledSkills: true });
```

### Direct API client access

```ts
import { makeApiRequest, loadConfig, initLogger } from 'freee-mcp-core';

await loadConfig();
initLogger();

const response = await makeApiRequest({ /* ... */ });
```

### Skill install helpers (for downstream wrappers)

```ts
import {
  installSkillsFrom,
  updateSkillsFrom,
  uninstallSkillsFrom,
  parseSkillCommandArgs,
  getBundledSkillsDir,
} from 'freee-mcp-core';

// Install both core's bundled skills and your own
const opts = parseSkillCommandArgs(process.argv.slice(2));
installSkillsFrom(getBundledSkillsDir(), opts);
installSkillsFrom('./my-skills', opts);
```

## CLI Usage (preserved from upstream)

```bash
# Interactive OAuth configuration
npx freee-mcp configure

# Start MCP server (stdio)
npx freee-mcp

# Other binaries (remote HTTP mode, freee-sign)
npx freee-remote-mcp
npx freee-sign-mcp
npx freee-sign-remote-mcp

# Skill management (added in this fork)
npx freee-mcp install-skills [--global|--local] [--force]
npx freee-mcp update-skills [--global|--local]
npx freee-mcp uninstall-skills [--global|--local]
```

`--global` targets `~/.claude/skills/` (default). `--local` targets `<cwd>/.claude/skills/`.

## Bundled Skills

This package ships `skills/freee-api-skill/` (forked from upstream freee/freee-mcp under Apache-2.0). The skill content is exposed two ways:

- MCP resources (universal): every markdown file under `skills/` is registered with URI `skill://<skill-name>/<path>`. Any MCP client (Claude Code, Cursor, Cline, etc.) can list and read them via the standard MCP resources/list and resources/read methods. No additional install required.
- Claude Code skill format (auto-injection): run `npx freee-mcp install-skills` to copy them into `~/.claude/skills/` so Claude Code can auto-inject them based on frontmatter matching.

## Relationship to upstream

This package is a derivative work of [freee/freee-mcp](https://github.com/freee/freee-mcp), tracked from a v0.25.4 baseline. The CLI binaries (`freee-mcp`, `freee-remote-mcp`, `freee-sign-mcp`, `freee-sign-remote-mcp`) remain behavior-compatible with upstream.

The additional surface area introduced by this fork:

- `exports` / `main` / `types` map in package.json for library consumption
- `src/lib.ts` re-exporting the public API
- `src/skills-path.ts` for resolving the bundled `skills/` directory at runtime
- `src/mcp/skill-resources.ts` for exposing skill content as MCP resources
- `src/cli/skills.ts` and `install-skills` / `update-skills` / `uninstall-skills` CLI subcommands

We welcome upstream PRs to add library exports directly to `freee/freee-mcp`. This package exists to provide that surface in the meantime.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

- Original code: Copyright 2024-present freee K.K.
- Modifications for library use: chisakiShinichirouToshiyuki

freee, freee会計, and related marks are trademarks of freee K.K. Use of those marks in this README is for descriptive purposes only and does not imply endorsement.
