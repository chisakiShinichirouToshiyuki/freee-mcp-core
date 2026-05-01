---
"free-mcp-core": patch
---

ci: use a Personal Access Token (`RELEASE_PAT`) for `changesets/action` so commits/pushes it makes are attributed to a real user rather than `github-actions[bot]`. Bot-attributed pushes don't trigger downstream workflows, which previously left the `publish` step stranded after every Release PR merge. With the PAT, merging the Release PR re-fires `release.yml` and runs the publish step automatically.
