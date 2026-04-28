// Library entry — re-exports public API surface for downstream consumers.
//
// CLI entry (src/index.ts) handles auto-init (logger, config). Library consumers
// MUST call init functions (initLogger, initTelemetry, loadConfig) themselves
// before using server primitives.

export { createMcpServer } from './mcp/handlers.js';
export { addAuthenticationTools } from './mcp/tools.js';
export { addFileUploadTool } from './mcp/file-upload-tool.js';
export { registerSkillResources } from './mcp/skill-resources.js';
export type { SkillResourceOptions } from './mcp/skill-resources.js';
export { generateClientModeTool } from './openapi/client-mode.js';
export {
  API_CONFIGS,
  validatePathForService,
  listAllAvailablePaths,
  type ApiType,
  type ApiConfig,
  type PathValidationResult,
} from './openapi/schema-loader.js';
export { makeApiRequest } from './api/client.js';
export {
  extractTokenContext,
  resolveCompanyId,
  type AuthExtra,
  type TokenContext,
} from './storage/context.js';
export {
  loadConfig,
  getConfig,
  type Config,
} from './config.js';
export {
  initLogger,
  getLogger,
  type Logger,
  type LoggerOptions,
} from './server/logger.js';
export {
  initUserAgentTransportMode,
  getUserAgent,
  type TransportMode,
} from './server/user-agent.js';
export { initTelemetry } from './telemetry/init.js';

// Skill bundle directory resolution helper for consumers that want to install
// or expose the bundled skills/ from this package.
export { getBundledSkillsDir } from './skills-path.js';

// Reusable skill install/update/uninstall helpers for downstream wrappers.
// Wrappers can call these for both core's bundled skills (via
// getBundledSkillsDir()) and their own skills/ directory.
export {
  installSkillsFrom,
  updateSkillsFrom,
  uninstallSkillsFrom,
  parseSkillCommandArgs,
  type SkillCommandOptions,
  type SkillCommandResult,
} from './cli/skills.js';
