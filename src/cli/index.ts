import fs from 'node:fs/promises';
import path from 'node:path';
import { stopCallbackServer } from '../auth/server.js';
import { clearTokens } from '../auth/tokens.js';
import { getConfigDir, PACKAGE_VERSION } from '../constants.js';
import { saveConfig } from './configuration.js';
import { detectHostPackage, type HostPackage } from './host-package.js';
import { performOAuth } from './oauth-flow.js';
import {
  collectCredentials,
  configureMcpIntegration,
  FREEE_MCP_PROFILE,
  type McpServerProfile,
  selectCompany,
} from './prompts.js';

export interface ConfigureOptions {
  force?: boolean;
}

async function clearConfig(): Promise<void> {
  const configPath = path.join(getConfigDir(), 'config.json');
  try {
    await fs.unlink(configPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

function profileFromHost(host: HostPackage): McpServerProfile {
  return {
    name: host.name,
    entry: { command: 'npx', args: [host.binName] },
  };
}

export async function configure(options: ConfigureOptions = {}): Promise<void> {
  console.log(`\n=== freee-mcp v${PACKAGE_VERSION} Configuration Setup ===\n`);

  if (options.force) {
    console.log('保存済みのログイン情報をリセットしています...');
    await clearTokens();
    await clearConfig();
    console.log('リセットが完了しました。\n');
  }

  const host = detectHostPackage();
  const mcpProfile = host ? profileFromHost(host) : FREEE_MCP_PROFILE;

  if (host) {
    console.log(`freee-mcp-core は ${host.name} のライブラリ依存として実行されています。`);
    console.log(`MCP 登録は freee-mcp ではなく ${host.name} を対象に行います。\n`);
  }

  console.log('このウィザードでは、freee-mcpの設定と認証を対話式で行います。');
  console.log('freee OAuth認証情報が必要です。\n');

  try {
    const credentials = await collectCredentials();
    const oauthResult = await performOAuth();
    const { selected: selectedCompany, all: allCompanies } = await selectCompany(
      oauthResult.accessToken,
    );
    await saveConfig(credentials, selectedCompany, allCompanies);
    await configureMcpIntegration(mcpProfile);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
    } else {
      console.error('\n設定中にエラーが発生しました:', error);
    }
    process.exit(1);
  } finally {
    stopCallbackServer();
  }
}
