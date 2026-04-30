/**
 * Host package detection.
 *
 * When freee-mcp-core is consumed as a library dependency
 * (e.g. logic-solver-mcp depends on freee-mcp-core via npm), the configure
 * wizard should register the host package's MCP server in Claude Code /
 * Claude Desktop, not freee-mcp itself. This module locates the immediate
 * host package by walking up from freee-mcp-core's install location and
 * returns a profile suitable for MCP registration.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF_PACKAGE_NAME = 'freee-mcp-core';

export type HostPackage = {
  name: string;
  binName: string;
  root: string;
};

type PackageJson = {
  name?: string;
  bin?: string | Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

function readPackageJson(dir: string): PackageJson | null {
  try {
    const content = readFileSync(path.join(dir, 'package.json'), 'utf-8');
    return JSON.parse(content) as PackageJson;
  } catch {
    return null;
  }
}

function dependsOnSelf(pkg: PackageJson): boolean {
  return (
    pkg.dependencies?.[SELF_PACKAGE_NAME] !== undefined ||
    pkg.devDependencies?.[SELF_PACKAGE_NAME] !== undefined ||
    pkg.peerDependencies?.[SELF_PACKAGE_NAME] !== undefined ||
    pkg.optionalDependencies?.[SELF_PACKAGE_NAME] !== undefined
  );
}

function pickBinName(pkg: PackageJson): string | null {
  if (!pkg.bin) {
    return null;
  }
  if (typeof pkg.bin === 'string') {
    return pkg.name ?? null;
  }
  const binNames = Object.keys(pkg.bin);
  if (binNames.length === 0) {
    return null;
  }
  // Prefer a bin entry matching the package name, otherwise the first one.
  if (pkg.name && binNames.includes(pkg.name)) {
    return pkg.name;
  }
  return binNames[0];
}

/**
 * Locate freee-mcp-core's installed root by walking up until we find our
 * own package.json. Falls back to the source-tree layout used during
 * `bun run start` from the freee-mcp-core repo.
 */
function findSelfRoot(startDir: string): string | null {
  let dir = startDir;
  while (true) {
    const pkg = readPackageJson(dir);
    if (pkg?.name === SELF_PACKAGE_NAME) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

/**
 * Detect the immediate host package that depends on freee-mcp-core, given
 * an arbitrary starting directory inside (or below) freee-mcp-core's own
 * package root. Exported for unit testing — callers in production should
 * use {@link detectHostPackage}.
 */
export function detectHostPackageFrom(startDir: string): HostPackage | null {
  const selfRoot = findSelfRoot(startDir);
  if (!selfRoot) {
    return null;
  }

  // For freee-mcp-core to be a dependency of a host, it must live under
  // `<host>/node_modules/freee-mcp-core` (or under
  // `<host>/node_modules/@scope/freee-mcp-core` for a scoped install).
  let cursor = path.dirname(selfRoot);
  if (path.basename(cursor).startsWith('@')) {
    cursor = path.dirname(cursor);
  }
  if (path.basename(cursor) !== 'node_modules') {
    return null;
  }

  const hostRoot = path.dirname(cursor);
  const hostPkg = readPackageJson(hostRoot);
  if (!hostPkg?.name) {
    return null;
  }
  if (hostPkg.name === SELF_PACKAGE_NAME) {
    return null;
  }
  if (!dependsOnSelf(hostPkg)) {
    return null;
  }
  const binName = pickBinName(hostPkg);
  if (!binName) {
    return null;
  }

  return { name: hostPkg.name, binName, root: hostRoot };
}

/**
 * Detect the immediate host package that depends on freee-mcp-core.
 * Returns null when freee-mcp-core is the top-level package (i.e. running
 * `freee-mcp configure` directly from the freee-mcp-core repo or via a
 * top-level `npx freee-mcp` install).
 */
export function detectHostPackage(): HostPackage | null {
  const here = fileURLToPath(import.meta.url);
  return detectHostPackageFrom(path.dirname(here));
}
