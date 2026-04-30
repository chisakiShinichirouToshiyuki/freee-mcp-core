import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectHostPackage, detectHostPackageFrom } from './host-package.js';

describe('detectHostPackage', () => {
  it('returns null when freee-mcp-core is the top-level package', () => {
    // Running tests from the freee-mcp-core source tree, the package is
    // the top-level — there is no enclosing host.
    expect(detectHostPackage()).toBeNull();
  });
});

describe('detectHostPackageFrom', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'freee-mcp-host-'));
  });

  afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  function setupHost(opts: {
    hostName: string;
    hostBin?: string | Record<string, string>;
    hostDeps?: Record<string, string>;
    selfDir?: string;
    selfNested?: boolean;
    scope?: string;
  }): { selfRoot: string; hostRoot: string } {
    const hostDirName = opts.hostName.includes('/') ? opts.hostName.split('/')[1] : opts.hostName;
    const hostRoot = opts.scope
      ? path.join(tmpRoot, 'parent', 'node_modules', opts.scope, hostDirName)
      : path.join(tmpRoot, hostDirName);
    const selfRoot = opts.scope
      ? path.join(hostRoot, 'node_modules', 'freee-mcp-core')
      : path.join(hostRoot, 'node_modules', 'freee-mcp-core');

    mkdirSync(selfRoot, { recursive: true });

    writeFileSync(
      path.join(hostRoot, 'package.json'),
      JSON.stringify({
        name: opts.hostName,
        bin: opts.hostBin,
        dependencies: opts.hostDeps,
      }),
    );
    writeFileSync(
      path.join(selfRoot, 'package.json'),
      JSON.stringify({ name: 'freee-mcp-core', version: '0.1.0' }),
    );
    return { selfRoot, hostRoot };
  }

  it('detects host package when freee-mcp-core is a dependency', () => {
    const { selfRoot, hostRoot } = setupHost({
      hostName: 'logic-solver-mcp',
      hostBin: { 'logic-solver-mcp': './bin/logic-solver-mcp.js' },
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
    });

    const result = detectHostPackageFrom(path.join(selfRoot, 'dist', 'cli'));

    expect(result).toEqual({
      name: 'logic-solver-mcp',
      binName: 'logic-solver-mcp',
      root: hostRoot,
    });
  });

  it('returns null when host does not depend on freee-mcp-core', () => {
    const { selfRoot } = setupHost({
      hostName: 'unrelated-pkg',
      hostBin: { 'unrelated-pkg': './bin.js' },
      hostDeps: { 'some-other-dep': '^1.0.0' },
    });

    expect(detectHostPackageFrom(selfRoot)).toBeNull();
  });

  it('returns null when host has no bin entry', () => {
    const { selfRoot } = setupHost({
      hostName: 'lib-only-pkg',
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
    });

    expect(detectHostPackageFrom(selfRoot)).toBeNull();
  });

  it('detects host with string-form bin field', () => {
    const { selfRoot } = setupHost({
      hostName: 'string-bin-pkg',
      hostBin: './bin.js',
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
    });

    const result = detectHostPackageFrom(selfRoot);
    expect(result?.name).toBe('string-bin-pkg');
    expect(result?.binName).toBe('string-bin-pkg');
  });

  it('prefers a bin entry matching the package name', () => {
    const { selfRoot } = setupHost({
      hostName: 'multi-bin-pkg',
      hostBin: {
        'helper-cli': './helper.js',
        'multi-bin-pkg': './main.js',
      },
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
    });

    expect(detectHostPackageFrom(selfRoot)?.binName).toBe('multi-bin-pkg');
  });

  it('falls back to the first bin entry when no name match', () => {
    const { selfRoot } = setupHost({
      hostName: 'no-match-pkg',
      hostBin: {
        'first-cli': './first.js',
        'second-cli': './second.js',
      },
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
    });

    expect(detectHostPackageFrom(selfRoot)?.binName).toBe('first-cli');
  });

  it('detects scoped host packages', () => {
    const { selfRoot } = setupHost({
      hostName: '@scope/host-pkg',
      hostBin: { 'host-pkg': './bin.js' },
      hostDeps: { 'freee-mcp-core': '^0.1.0' },
      scope: '@scope',
    });

    const result = detectHostPackageFrom(selfRoot);
    expect(result?.name).toBe('@scope/host-pkg');
    expect(result?.binName).toBe('host-pkg');
  });

  it('accepts devDependencies / peerDependencies as a valid host link', () => {
    const hostRoot = path.join(tmpRoot, 'dev-host');
    const selfRoot = path.join(hostRoot, 'node_modules', 'freee-mcp-core');
    mkdirSync(selfRoot, { recursive: true });
    writeFileSync(
      path.join(hostRoot, 'package.json'),
      JSON.stringify({
        name: 'dev-host',
        bin: { 'dev-host': './bin.js' },
        devDependencies: { 'freee-mcp-core': '^0.1.0' },
      }),
    );
    writeFileSync(
      path.join(selfRoot, 'package.json'),
      JSON.stringify({ name: 'freee-mcp-core', version: '0.1.0' }),
    );

    expect(detectHostPackageFrom(selfRoot)?.name).toBe('dev-host');
  });

  it('returns null when freee-mcp-core lives outside any node_modules', () => {
    const selfRoot = path.join(tmpRoot, 'standalone-clone');
    mkdirSync(selfRoot, { recursive: true });
    writeFileSync(
      path.join(selfRoot, 'package.json'),
      JSON.stringify({ name: 'freee-mcp-core', version: '0.1.0' }),
    );

    expect(detectHostPackageFrom(selfRoot)).toBeNull();
  });
});
