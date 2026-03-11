# coding-agent-work

A small TypeScript workspace for exploring a CLI-style coding agent.

This repository currently contains:

- `agent`: a CLI coding-agent prototype that runs verification, retrieves evidence, and persists structured run artifacts.
- `agent-playground`: a tiny TypeScript project with a deliberate bug and a failing test, used as a target repo for the agent.

The codebase is intentionally small. It is meant to make the agent loop easy to understand before adding real automation such as repository scanning, code edits, and test execution.

## Repository Structure

```text
.
├── agent/
│   ├── src/
│   │   ├── app/              # use-case orchestration
│   │   ├── artifacts/        # run artifact persistence
│   │   ├── cli/              # argument parsing and process exit behavior
│   │   ├── domain/           # shared domain types
│   │   ├── infra/            # command/file/search adapters
│   │   ├── retrieval/        # repository evidence retrieval logic
│   │   └── verification/     # verification step runners
│   └── runs/                 # JSON run artifacts
└── agent-playground/
    └── src/
        ├── sum.ts
        └── sum.test.ts
```

## What The Agent Does Today

The current agent does the following:

1. Reads command-line arguments from `process.argv`.
2. Accepts only the `fix` command.
3. Requires `--repo` and `--issue`.
4. Verifies that the target repo path exists.
5. Runs `pnpm test` in the target repo and captures structured output.
6. Retrieves likely related files using issue keywords, test output paths, and test-import expansion.
7. Persists a typed `RunRecord` artifact in `agent/runs/*.json`.

It does **not** yet:

- generate code patches with an LLM
- apply patches to the repository
- run multi-step verification (`lint/tsc/test/build`)
- loop on failures for automatic repair

## Quick Start

### Requirements

- Node.js 20+ recommended
- `pnpm` 10

### Install Dependencies

Install dependencies in each package:

```bash
cd agent
pnpm install
```

```bash
cd agent-playground
pnpm install
```

## Run The Agent Prototype

From the `agent` directory:

```bash
pnpm agent fix --repo ../agent-playground --issue "sum test is failing"
```

Expected behavior:

- the CLI validates the command
- the CLI validates the repo path
- the CLI executes tests and retrieval
- the CLI saves a structured run artifact path

If the command or arguments are invalid, it exits with a usage message or an error.

## Run The Playground Test

From the `agent-playground` directory:

```bash
pnpm test
```

This test is expected to fail right now because [`sum.ts`](/Users/xinzhanxuan/coding-agent-work/agent-playground/src/sum.ts) contains an intentional off-by-one bug.

## Why This Repo Exists

The goal is to build up an agent loop step by step:

1. Accept a task from the command line.
2. Inspect a target repository.
3. Identify relevant files.
4. Run tests or checks.
5. Apply a fix.
6. Re-run validation.
7. Report the result.

The current implementation now covers steps 1-4 partially (with logs), but does not yet perform edit/apply/retry automation.

## Current Tech Stack

- TypeScript
- `tsx` for running TypeScript directly
- `vitest` in the playground project
- `execa` for command execution and repo search helpers

## Next Steps

Good next milestones for this project:

1. Add LLM patch generation with strict unified-diff output constraints.
2. Add safe patch application (`git apply --check` then `git apply`).
3. Add verification pipeline orchestration (`lint -> tsc -> test -> build`).
4. Add loop control for retry/failure taxonomy and stop conditions.
5. Add regression tasks and basic success-rate metrics.

## License

No license has been added yet. If you plan to publish this on GitHub, add one before making reuse expectations public.
