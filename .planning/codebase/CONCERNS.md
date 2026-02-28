# CONCERNS

## Technical Debt & Complexities
- Scalability: Extensively relying on single entry point SDK abstractions might become a bottleneck under large throughputs.
- Abstraction leak: SDK types (`PutItemCommandOutput`, etc.) leaking outside `src/lib/` components to direct UI context in some implementations.

## Security Practices
- Reliance on complex manual IAM/Cognito setups in `.env` could be heavily vulnerable if secrets leak or environment configuration breaks.
- Use of local script runners (`ts-node`) across multiple sensitive paths.
- Rate limiting implemented `src/lib/rate-limit.ts` must be thoroughly stress tested.

## Maintainability
- 60+ individual `.ts` script files inside `scripts/`, a mix of test files, migration logic, seeding helpers, leading to heavily cluttered root tooling.
