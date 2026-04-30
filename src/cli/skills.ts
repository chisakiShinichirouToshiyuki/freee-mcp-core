// CLI helpers for installing/updating/uninstalling skill content into the
// user's project (or global) .claude/skills/ directory.
//
// Two layers:
//   - *From(srcDir, opts) — re-usable by downstream consumers (wrappers) so
//     they can install both core's bundled skills and their own.
//   - install/update/uninstallSkills(opts) — convenience for the freee-mcp
//     CLI which only handles core's bundled skills.
//
// Read is intentionally not provided as a CLI command — skill content is
// exposed via MCP resources (resources/list, resources/read), so agents
// and humans can read directly via the MCP protocol.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getBundledSkillsDir } from '../skills-path.js';

export interface SkillCommandOptions {
  scope: 'global' | 'local';
  force: boolean;
}

export interface SkillCommandResult {
  targetDir: string;
  affected: string[];
}

function resolveTargetDir(scope: 'global' | 'local'): string {
  return scope === 'global'
    ? join(homedir(), '.claude', 'skills')
    : join(process.cwd(), '.claude', 'skills');
}

function listSkillNames(srcDir: string): string[] {
  if (!existsSync(srcDir)) return [];
  return readdirSync(srcDir).filter((name) => statSync(join(srcDir, name)).isDirectory());
}

// Install skills from an arbitrary source directory. Reusable by downstream
// consumers (wrappers) that bundle their own skills/ alongside core's.
export function installSkillsFrom(srcDir: string, opts: SkillCommandOptions): SkillCommandResult {
  const targetDir = resolveTargetDir(opts.scope);
  const skillNames = listSkillNames(srcDir);

  if (skillNames.length === 0) {
    console.error(`No skills found at ${srcDir}`);
    return { targetDir, affected: [] };
  }

  mkdirSync(targetDir, { recursive: true });
  const affected: string[] = [];

  for (const skillName of skillNames) {
    const src = join(srcDir, skillName);
    const dest = join(targetDir, skillName);

    if (existsSync(dest) && !opts.force) {
      console.error(
        `Skill already exists: ${dest} (use --force to overwrite, or run update-skills)`,
      );
      process.exit(1);
    }

    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
    console.error(`Installed: ${dest}`);
    affected.push(skillName);
  }

  return { targetDir, affected };
}

export function updateSkillsFrom(srcDir: string, opts: SkillCommandOptions): SkillCommandResult {
  const targetDir = resolveTargetDir(opts.scope);
  const skillNames = listSkillNames(srcDir);

  if (skillNames.length === 0) {
    console.error(`No skills found at ${srcDir}`);
    return { targetDir, affected: [] };
  }

  mkdirSync(targetDir, { recursive: true });
  const affected: string[] = [];

  for (const skillName of skillNames) {
    const src = join(srcDir, skillName);
    const dest = join(targetDir, skillName);
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
    console.error(`Updated: ${dest}`);
    affected.push(skillName);
  }

  return { targetDir, affected };
}

export function uninstallSkillsFrom(srcDir: string, opts: SkillCommandOptions): SkillCommandResult {
  const targetDir = resolveTargetDir(opts.scope);
  const skillNames = listSkillNames(srcDir);

  if (!existsSync(targetDir)) {
    console.error(`No skills directory at ${targetDir}; nothing to do.`);
    return { targetDir, affected: [] };
  }

  const affected: string[] = [];
  for (const skillName of skillNames) {
    const dest = join(targetDir, skillName);
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
      console.error(`Removed: ${dest}`);
      affected.push(skillName);
    }
  }

  return { targetDir, affected };
}

// Convenience wrappers that target core's bundled skills (used by the CLI
// dispatcher in src/index.ts). Downstream wrappers should use *From variants.

export function installSkills(opts: SkillCommandOptions): void {
  const result = installSkillsFrom(getBundledSkillsDir(), opts);
  console.error(`Installed ${result.affected.length} skill(s) to ${result.targetDir}`);
}

export function updateSkills(opts: SkillCommandOptions): void {
  const result = updateSkillsFrom(getBundledSkillsDir(), opts);
  console.error(`Updated ${result.affected.length} skill(s) at ${result.targetDir}`);
}

export function uninstallSkills(opts: SkillCommandOptions): void {
  const result = uninstallSkillsFrom(getBundledSkillsDir(), opts);
  console.error(`Removed ${result.affected.length} skill(s) from ${result.targetDir}`);
}

export function parseSkillCommandArgs(args: string[]): SkillCommandOptions {
  const scope: 'global' | 'local' = args.includes('--local') ? 'local' : 'global';
  const force = args.includes('--force');
  return { scope, force };
}
