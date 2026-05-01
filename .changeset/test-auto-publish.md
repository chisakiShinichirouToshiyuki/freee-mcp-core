---
"free-mcp-core": patch
---

chore: smoke-test the auto-publish workflow

End-to-end exercise of the new release pipeline (push-to-main trigger +
Trusted Publishing). Bumps to 0.1.0-rc.2 to verify the Release PR is
auto-created and that the subsequent publish step authenticates via
GitHub OIDC without needing NPM_TOKEN.
