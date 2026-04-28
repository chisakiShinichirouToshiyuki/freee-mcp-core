import { dependencies, version } from './package.json';
import { chmod, copyFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';

// CLI binaries (banner = shebang). Existing behavior — preserved for
// upstream compatibility.
const binEntries = [
  { entrypoint: 'src/index.ts', output: './bin/freee-mcp.js' },
  { entrypoint: 'src/entry-remote.ts', output: './bin/freee-remote-mcp.js' },
  { entrypoint: 'src/sign/index.ts', output: './bin/freee-sign-mcp.js' },
  { entrypoint: 'src/sign/entry-remote.ts', output: './bin/freee-sign-remote-mcp.js' },
];

for (const { entrypoint, output } of binEntries) {
  const result = await Bun.build({
    entrypoints: [entrypoint],
    external: Object.keys(dependencies),
    minify: true,
    target: 'node',
    format: 'esm',
    outdir: '.',
    naming: { entry: output },
    define: {
      __PACKAGE_VERSION__: JSON.stringify(version),
    },
    banner: '#! /usr/bin/env node\n',
  });

  if (!result.success) {
    console.error(`Build failed for ${entrypoint}:`);
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  await chmod(output, 0o755);
  console.log(`Built ${output}`);
}

// Library entry — non-bundled, no shebang. Consumers `import` from this.
{
  const libResult = await Bun.build({
    entrypoints: ['src/lib.ts'],
    external: Object.keys(dependencies),
    minify: false,
    target: 'node',
    format: 'esm',
    outdir: './dist',
    naming: { entry: 'lib.js' },
    define: {
      __PACKAGE_VERSION__: JSON.stringify(version),
    },
  });

  if (!libResult.success) {
    console.error('Library build failed for src/lib.ts:');
    for (const log of libResult.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log('Built ./dist/lib.js');
}

// Type declarations (.d.ts) for consumers. Emitted via tsc into dist/.
{
  const tscResult = Bun.spawnSync({
    cmd: ['bunx', 'tsc', '--emitDeclarationOnly', '--declaration', '--outDir', './dist'],
    stdout: 'inherit',
    stderr: 'inherit',
  });
  if (tscResult.exitCode !== 0) {
    console.error('Type declaration emit failed (tsc).');
    process.exit(1);
  }
  console.log('Emitted dist/*.d.ts');
}

// Copy minimal schema files to dist for npm package
const minimalSrcDir = './openapi/minimal';
const minimalDestDir = './dist/openapi/minimal';
await mkdir(minimalDestDir, { recursive: true });

const minimalFiles = await readdir(minimalSrcDir);
for (const file of minimalFiles) {
  if (file.endsWith('.json')) {
    await copyFile(join(minimalSrcDir, file), join(minimalDestDir, file));
  }
}
console.log(`Copied ${minimalFiles.filter(f => f.endsWith('.json')).length} minimal schema files to dist/`);
