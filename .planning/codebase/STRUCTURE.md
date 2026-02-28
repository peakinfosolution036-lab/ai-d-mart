# STRUCTURE

## File System Layout
- `src/app/`: Next.js 14 App Router routes (`page.tsx`, `layout.tsx`, `api/route.ts`).
- `src/components/`: Reusable React Server / Client components.
- `src/context/`: Core React application state providers.
- `src/hooks/`: Abstracted logic bindings.
- `src/lib/`: External wrappers (DynamoDB, Cognito, S3, Email Resend/Gmail SDK).
- `src/types/`: Typescript interfaces for models.
- `scripts/`: Huge assortment of TS util scripts (`ts-node` managed):
  - Initialization (`seed-data.ts`, `setup-shop.ts`)
  - DB Configuration (`dynamodb-tables/*`)
  - Test suites (`test-auth-flow.ts`, `test-app.ts`)
  - Utility migrations (`fix-customer-cognito.ts`)

## Entry Points
- `src/app/layout.tsx`: Root React wrapper.
- `src/app/page.tsx`: Application landing page.
- AWS Cognito User Pool flows entry points (`src/lib/auth.ts`).

## Naming Conventions
- React components use `PascalCase` (`Footer.tsx`).
- Utility modules use `kebab-case` or `camelCase` (`email-resend.ts`, `cognito.ts`).
- Directory names are `kebab-case` (`api/lucky-draw/winners`).
