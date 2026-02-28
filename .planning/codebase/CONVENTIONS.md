# CONVENTIONS

## Functional Paradigms
- Prefer functional components utilizing React hooks.
- Strong separation between Next.js `Server Components` and `Client Components` (indicated by "use client").

## Typescript
- Strong typing implemented for standard objects (`src/types/index.ts`).
- Avoidance of `any` types. Direct AWS SDK SDK input/output shapes are mapped.

## Async & Error Handling
- Use `try/catch` wrapping around `src/lib/` wrapper APIs.
- Throw custom or SDK errors directly to caller in API routes to bubble up JSON formatted failures mapping to HTTP statuses (e.g. `NextResponse.json({ error }, { status: 500 })`).

## Code Styling
- Tailwind utility classes mapped to standard configurations.
- Formatted via ESLint configuration extending `eslint-config-next`.
