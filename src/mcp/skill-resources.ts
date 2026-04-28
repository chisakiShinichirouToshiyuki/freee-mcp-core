// MCP resource registration for bundled skill content.
//
// Each markdown file under <skillsDir>/<skill-name>/ is exposed as an MCP
// resource with URI `skill://<skill-name>/<relative-path>`. Any MCP client
// (Claude Code, Cursor, Cline, etc.) can list and read these resources via
// the standard MCP resources/list and resources/read methods.
//
// This lets us ship skill content via npm (no plugin marketplace required)
// and have it discoverable by every MCP client through the protocol itself.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getBundledSkillsDir } from '../skills-path.js';

export interface SkillResourceOptions {
  // Override the directory to scan. Defaults to the bundle shipped with this
  // package (resolved via getBundledSkillsDir()).
  skillsDir?: string;
  // URI scheme prefix. Defaults to 'skill://'.
  scheme?: string;
  // File extensions to register. Defaults to ['.md'].
  extensions?: string[];
}

export function registerSkillResources(
  server: McpServer,
  options: SkillResourceOptions = {},
): void {
  const skillsDir = options.skillsDir ?? getBundledSkillsDir();
  const scheme = options.scheme ?? 'skill://';
  const extensions = options.extensions ?? ['.md'];

  if (!existsSync(skillsDir)) return;

  for (const skillName of readdirSync(skillsDir)) {
    const skillRoot = join(skillsDir, skillName);
    if (!statSync(skillRoot).isDirectory()) continue;
    walkAndRegister(server, skillRoot, skillName, scheme, extensions);
  }
}

function walkAndRegister(
  server: McpServer,
  skillRoot: string,
  skillName: string,
  scheme: string,
  extensions: string[],
): void {
  const stack: string[] = [skillRoot];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!extensions.some((ext) => full.endsWith(ext))) continue;

      const rel = relative(skillRoot, full);
      const uri = `${scheme}${skillName}/${rel.split(/[\\/]/).join('/')}`;
      const name = `${skillName}/${rel}`;

      // biome-ignore lint/suspicious/noExplicitAny: MCP SDK resource handler signature varies across versions
      (server as any).resource(
        name,
        uri,
        { mimeType: extensions.find((ext) => full.endsWith(ext)) === '.md' ? 'text/markdown' : 'text/plain' },
        async () => ({
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: readFileSync(full, 'utf-8'),
            },
          ],
        }),
      );
    }
  }
}
