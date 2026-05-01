---
"free-mcp-core": patch
---

ci: restrict Claude Code workflows to OWNER / COLLABORATOR / MEMBER actors so drive-by mentions or PRs from random forkers cannot consume the repo's CLAUDE_CODE_OAUTH_TOKEN. Auto code review is additionally limited to PRs whose head branch lives in this repository (no fork PRs).
