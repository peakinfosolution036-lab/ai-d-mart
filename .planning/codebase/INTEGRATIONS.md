# INTEGRATIONS

## Database & Storage
- **Amazon DynamoDB**: Core data store wrapper (`src/lib/dynamodb.ts`, `src/lib/db.ts`). Setup via scripts in `scripts/dynamodb-tables/`.
- **Amazon S3**: Assets and image storage via AWS SDK v3.

## Authentication
- **Amazon Cognito Identity Provider**: Managed user authentication, wrapped in `src/lib/cognito.ts` and `src/lib/auth.ts`.
- **Admin Auth**: Role-specific wrapper (`src/lib/admin-auth.ts`).

## Email Services
- **AWS SES**: Transactional and scalable email `src/lib/email.ts`.
- **Resend**: Transactional emails `src/lib/email-resend.ts`.
- **Gmail (Nodemailer)**: Backup/alternative email transporter `src/lib/email-gmail.ts`.

## External Services
- Possible third-party rate limiters or caching instances (custom local implementations in `src/lib/rate-limit.ts`).
