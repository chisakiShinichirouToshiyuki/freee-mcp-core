---
"freee-mcp-core": minor
---

`freee-mcp configure` が freee-mcp-core を npm 依存としてラップしている親パッケージを自動検出し、Claude Code / Claude Desktop の MCP 登録を `freee-mcp` ではなく親パッケージ (例: `logic-solver-mcp`) として書き込むようにした。トップレベルで `npx freee-mcp configure` を実行する従来の挙動は変更なし。

- 検出ロジック: `<host>/node_modules/freee-mcp-core` (scoped install 含む) を走査し、host の package.json が freee-mcp-core を依存として宣言し bin を持つ場合に host の bin 名で `npx <host-bin>` エントリを登録
- 親が検出された場合は Skill インストール手引きを host 側ドキュメントに委ねる
- `mcp-config.ts` は任意のサーバー名で status check / remove ができるよう汎用化 (`removeMcpServerConfig`, 引数付き `checkMcpConfigStatus`)
