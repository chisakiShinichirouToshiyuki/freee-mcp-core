import { configure } from './cli.js';
import {
  installSkills,
  parseSkillCommandArgs,
  uninstallSkills,
  updateSkills,
} from './cli/skills.js';
import { createAndStartServer } from './mcp/handlers.js';
import { getLogger, initLogger } from './server/logger.js';
import { initUserAgentTransportMode } from './server/user-agent.js';

const main = async (): Promise<void> => {
  initUserAgentTransportMode('stdio');

  const args = process.argv.slice(2);
  const subcommand = args.find((arg) => !arg.startsWith('--'));

  if (subcommand === 'configure') {
    const force = args.includes('--force');
    await configure({ force });
    return;
  }

  if (subcommand === 'install-skills') {
    installSkills(parseSkillCommandArgs(args));
    return;
  }

  if (subcommand === 'update-skills') {
    updateSkills(parseSkillCommandArgs(args));
    return;
  }

  if (subcommand === 'uninstall-skills') {
    uninstallSkills(parseSkillCommandArgs(args));
    return;
  }

  if (subcommand && subcommand !== 'client') {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error('Usage: freee-mcp [subcommand] [options]');
    console.error('  configure          - Interactive configuration setup');
    console.error('    --force          - 保存済みのログイン情報をリセットして再設定');
    console.error('  install-skills     - Install bundled skills to .claude/skills/');
    console.error('  update-skills      - Overwrite installed skills with bundled versions');
    console.error('  uninstall-skills   - Remove installed skills');
    console.error('    --global         - Target ~/.claude/skills/ (default)');
    console.error('    --local          - Target <cwd>/.claude/skills/');
    console.error('    --force          - install-skills only: overwrite if exists');
    process.exit(1);
  }

  initLogger({ transportMode: 'stdio' });
  getLogger().info('Starting freee MCP server');
  await createAndStartServer();
};

main().catch((error) => {
  getLogger().fatal({ err: error }, 'Fatal error');
  process.exit(1);
});
