---
"freee-mcp-core": patch
---

`freee-mcp configure` の host 検出時に登録する MCP エントリを `npx <hostBin>` から `node <絶対パス>` に変更。npm 未公開の host (例: 開発中の logic-solver-mcp) でも `npx` がレジストリ解決失敗を起こさず確実に起動できる。bin 名と上流 npm パッケージ名が同名の場合に意図しない別パッケージを引いてしまう事故も防ぐ。
