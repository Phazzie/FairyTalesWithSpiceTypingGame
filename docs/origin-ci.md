# Origin CI

GitHub Actions cannot run on this account (billing lock). CI for this repo moves to Cursor Origin, which runs the Depot app. Depot reads GitHub Actions-syntax YAML from `.depot/workflows/` and executes it on `depot-ubuntu-24.04` after the repository is detached from GitHub.

The default branch is `main`.

## GitHub workflows

There is no `.github/workflows/` directory in the tree or in git history. Nothing was deleted. The directory is left absent on purpose: there is no GitHub workflow to keep running, and a new file there would not execute once the repo is detached.

| GitHub workflow | Depot equivalent | Fate |
| --- | --- | --- |
| None | `.depot/workflows/ci.yml` | New workflow. Runs on every pull request and on pushes to `main`. |

## Depot jobs

### `verify`

Locked install, then this repo's real commands:

| Step | Command | What it runs |
| --- | --- | --- |
| Install | `npm ci --include=dev` | Versions from `package-lock.json`, including devDependencies, even if the runner sets `NODE_ENV=production`. |
| Check | `npm run check` | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json` |
| Test | `npm run test:run` | `vitest run`, then `node --test scripts/ai-review.test.mjs` |
| Build | `npm run build` | `vite build` |

`npm test` stays `vitest` (watch mode) for local use. Watch mode would hang a CI job, so Depot calls `test:run`.

There is no lint script and no ESLint or Prettier config. `npm run check` is the static check.

There is no end-to-end or Playwright suite, so the workflow has no browser job.

### `ai-review`

Runs only on `pull_request`. It does not install npm packages. The step is `node scripts/ai-review.mjs`.

- Reads `XAI_API_KEY`. When the secret is missing or blank, the script prints `AI review skipped: XAI_API_KEY is not set` and exits 0.
- Diffs the pull request against `GITHUB_BASE_REF` (fallback `main`) and asks Grok (`grok-4.5`) to comment on bugs, security issues, scoring, save/resume, and invalid story chapters.
- Posts with `origin pr comment <PR_NUMBER> --body-file <file> --edit-last --create-if-none`.
- When `origin` is not on `PATH`, the script prints the review and `origin CLI is not installed`, then exits 0. Other Origin comment failures are also printed and do not fail the job.
- When `PR_NUMBER` is unset, the review is printed to the log only.
- A GitHub issue-comment fallback remains in the script for a checkout that still has `GITHUB_TOKEN` and `GITHUB_REPOSITORY`. This workflow does not set either variable.

## GitHub-only pieces that will be dropped

- No GitHub Actions workflow, environment, required check, or Actions secret exists to copy or retire.
- Depot will not run anything placed under `.github/workflows/` after detach. Do not add release, CodeQL, or dependency-review workflows there expecting them to fire.
- The script's GitHub comment API path is unused by this workflow. After detach, review comments go through the Origin CLI only.
- `actions/checkout` and `actions/setup-node` stay in the Depot file. Depot executes that syntax on `depot-ubuntu-24.04`; they are not a GitHub-hosted runner.

## Secrets to enter in Depot

No GitHub Actions secrets exist to migrate. Enter this in the Depot project if you want review comments:

| Secret | Required for a green job | Used by |
| --- | --- | --- |
| `XAI_API_KEY` | No. The job skips and exits 0 without it. | `ai-review` only. Sent as a bearer token to `https://api.x.ai/v1/chat/completions`. |

`GROK_API_KEY` is the app's runtime key (`src/lib/server/ai/client.ts`). These CI jobs do not read it. Story generation is not called by check, test, or build. If the same xAI key should write reviews, store it in Depot under the name `XAI_API_KEY`.

Do not set `GITHUB_TOKEN` on the Depot job. The workflow is written to comment with `origin pr comment`.
