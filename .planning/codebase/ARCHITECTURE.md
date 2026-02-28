# ARCHITECTURE

## System Design
- **Frontend Architecture**: Built around Next.js App Router (`src/app`). Combines React server and client components cleanly.
- **Backend Architecture**: API route handlers (`src/app/api`) mapped tightly to core service boundaries.
- **Data Layer Access**: Service layers directly wrapping AWS SDK v3 in `src/lib/` (e.g. `src/lib/dynamodb.ts` handles generic NoSQL CRUD queries, raw interactions).

## Data Flow
- **Client (React)** → **Next.js `/api` Route Handlers** → **Service Wrapper (`src/lib`)** → **AWS DynamoDB / Cognito**
- Client manages localized contextual states in `/src/context` hooks structure, delegating to `/src/hooks` when logic is reusable.

## State Management
- Utilizing built-in React contexts over external solutions like Redux.

## Core Abstractions
- **Authentication**: Encapsulated away from direct API interaction by `src/lib/auth.ts` and `src/lib/admin-auth.ts`.
- **Database**: `db.ts` and `dynamodb.ts` abstract away DynamoDB DocClient constraints to standard CRUD types and objects.
- **Reporting / Emails**: `src/lib/email.ts` creates scalable abstraction independent of exact transporters.
