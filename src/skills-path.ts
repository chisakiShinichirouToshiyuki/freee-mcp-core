// Resolves the path to the bundled skills/ directory shipped with this
// package. Works whether the consumer imports from source (dev) or from
// node_modules (installed).
//
// dist/ layout after build:
//   <pkg-root>/dist/skills-path.js
// src layout (dev):
//   <pkg-root>/src/skills-path.ts
//
// The bundled skills/ always lives at <pkg-root>/skills/ (npm files entry).

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getBundledSkillsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // From either dist/ or src/, the package root is one level up.
  return resolve(here, '..', 'skills');
}
