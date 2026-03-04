# coding-agent-work

A small TypeScript workspace for exploring a CLI-style coding agent.

This repository currently contains:

- `agent`: a minimal command-line entry point that accepts a `fix` task, validates input, and prints a structured task payload.
- `agent-playground`: a tiny TypeScript project with a deliberate bug and a failing test, used as a target repo for the agent.

The codebase is intentionally small. It is meant to make the agent loop easy to understand before adding real automation such as repository scanning, code edits, and test execution.

## Repository Structure

```text
.
├── agent/
│   └── src/cli/index.ts
└── agent-playground/
    └── src/
        ├── sum.ts
        └── sum.test.ts
```

## What The Agent Does Today

The current CLI is a thin prototype. It does the following:

1. Reads command-line arguments from `process.argv`.
2. Accepts only the `fix` command.
3. Requires `--repo` and `--issue`.
4. Verifies that the target repo path exists.
5. Prints a JSON payload describing the task and the next planned step.

It does **not** yet:

- inspect the target repository
- run tests
- edit code
- verify a fix automatically

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
- the CLI prints a JSON object with `cmd`, `repo`, `issue`, `now`, and `next`

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

The current implementation covers only the first step and a small part of task validation.

## Current Tech Stack

- TypeScript
- `tsx` for running TypeScript directly
- `vitest` in the playground project
- `execa` is installed in `agent` for future command execution work

## Next Steps

Good next milestones for this project:

1. Use `execa` in `agent` to run tests inside the target repo.
2. Add basic repository inspection (for example, detect `package.json` and test scripts).
3. Capture test failures and print a structured diagnosis.
4. Implement a first automatic fix flow for the playground bug.
5. Add integration tests for the CLI itself.

## License

No license has been added yet. If you plan to publish this on GitHub, add one before making reuse expectations public.
