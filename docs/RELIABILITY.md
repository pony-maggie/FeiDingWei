# Reliability

## Reliability Goal

FeiDingWei should make agent work visible, reversible, and verifiable. The MVP should prefer explicit draft artifacts and inspectable run history over hidden automation.

## Verification Strategy

Planned verification commands:

```bash
npm run test
npm run build
npm run test:e2e
```

Standard startup and verification:

```bash
./init.sh
```

## Required Test Coverage

- Domain schema tests for task, artifact, and agent statuses.
- Room service tests for sorting, draft counting, and approval behavior.
- Agent tool tests for draft task and document creation.
- Pi runtime tests for faux provider responses and assistant text extraction.
- Component tests for room tab navigation.
- Playwright E2E test for chat to agent to draft artifacts to approval.

## Agent Safety Rules

- Agents create drafts by default.
- Generated tasks and docs require human approval before becoming active.
- Agent runs must record status, input, output, error, source message, room, and agent.
- Failed runs must be visible.
- Tool execution should be sequential in the MVP for easier traceability.

## Observability Expectations

The MVP should expose:

- Agent run status.
- Agent output message.
- Generated task and document status.
- Source links from artifacts to source messages and agent runs when implemented.

## Clean Restart Expectations

From a clean checkout:

1. Dependencies install.
2. Prisma client generates.
3. Database migrates.
4. Seed data loads.
5. Tests pass.
6. Build passes.
7. E2E workflow passes when the app is implemented.

## Known Reliability Risks

- External model providers can fail or behave differently; v0 uses Pi faux provider for deterministic local runs.
- Agent-generated output can be wrong; human approval remains mandatory.
- Long-running agents can complicate UI state; v0 uses synchronous run completion before introducing streaming.
- Database state can drift; seed and migration commands must remain reliable.
