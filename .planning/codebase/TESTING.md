# TESTING

## Test Suites (Ad-hoc)
- Test executions rely completely on `ts-node` scripted utilities rather than `Jest` or `Vitest`.
- Extensive shell and TS-node commands scattered across `scripts/` folder tests APIs and integrations in isolation (e.g. `test-auth.sh`, `scripts/test-auth-flow.ts`, `test-app.ts`).

## E2E and UI Rendering
- Currently manual validation relying on local execution (`npm run dev`).

## Deficits
- Total lack of automated continuous testing.
- No CI/CD integrations listed testing components.
- No unit tests existing for React Components or complex AWS wrapper abstractions.
