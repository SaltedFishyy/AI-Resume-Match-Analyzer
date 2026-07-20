# AGENTS.md

## Project overview

AI Resume Match Analyzer is a full-stack Next.js App Router application
that compares a resume with a job description and returns rubric-based
feedback.

The application uses:

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- OpenAI Responses API
- Zod
- Prisma and PostgreSQL
- Clerk authentication
- Vercel deployment

The current product flow is:

1. The user submits resume text and a job description.
2. `/api/analyze` validates the request with Zod.
3. OpenAI generates rubric scores and recommendations.
4. The server calculates the final match score.
5. Prisma saves the analysis for the current user.
6. The user can review saved results through the history pages.

## Communication

- Communicate with the user in Chinese.
- Keep code, filenames, variable names, comments, documentation, and commit messages in English.
- Explain important technical decisions in clear, beginner-friendly Chinese.
- If requirements are unclear or materially affect product behavior, ask before implementing.
- Clearly distinguish verified behavior from recommendations.

## Engineering principles

- Follow the existing project structure and coding style.
- Keep changes focused, readable, and TypeScript-safe.
- Prefer simple solutions over unnecessary abstractions.
- Do not rewrite or reformat unrelated files.
- Do not implement future-phase features unless explicitly requested.
- Do not install or upgrade production dependencies without approval.
- Preserve existing analysis, authentication, database, and history behavior.
- Use Server Components by default and Client Components only when client-side state or browser APIs are required.
- Use the existing `@/` import alias.
- Use Zod to validate external and AI-generated data.
- Break up excessively long JSX when editing the affected component.

## Resume integrity

Resume content must remain factual.

- Never invent employers, job titles, education, projects, skills, achievements, dates, or metrics.
- Rewrite or reorganize only information supported by the submitted resume.
- Do not recommend adding a missing keyword as an existing skill unless the resume provides evidence for it.
- Keep AI outputs grounded in the supplied resume and job description.
- Maintain structured-output validation for OpenAI responses.

## Important files

- `app/api/analyze/route.ts`: OpenAI analysis, scoring, and database save flow.
- `components/AnalyzeForm.tsx`: analyze form and client request state.
- `components/AnalysisResult.tsx`: analysis result presentation.
- `components/AnalysisHistory.tsx`: saved analysis cards.
- `app/history/page.tsx`: user-scoped history query.
- `app/history/[id]/page.tsx`: user-scoped analysis detail page.
- `lib/validators.ts`: request and response schemas.
- `lib/openai.ts`: OpenAI client initialization.
- `lib/prisma.ts`: Prisma client singleton.
- `lib/current-user.ts`: Clerk and local-preview user resolution.
- `middleware.ts`: route protection.
- `prisma/schema.prisma`: database models.
- `prisma/migrations/`: database migration history.

## Sensitive changes

Explain the impact and ask for approval before:

- Changing the Prisma schema or creating migrations.
- Changing authentication or protected-route behavior.
- Changing the scoring rubric or final score calculation.
- Adding or upgrading production dependencies.
- Changing the format of stored analysis data.
- Introducing breaking API response changes.

Do not edit existing migration files after they have been applied.

## Security and privacy

- Never expose, print, commit, or include secret values in responses.
- Never log full resume text or job descriptions.
- Never log API keys, database URLs, Clerk secrets, or authentication tokens.
- Keep user-specific database queries scoped by `userId`.
- Do not remove ownership checks from history detail queries.
- Do not expose internal error details to users.
- Preserve `.env` and secret-file exclusions in `.gitignore`.
- Do not describe the public deployment as secure for multiple users when Clerk is not configured.
- Remember that the local preview-user fallback is intended only for local development.

Environment variable names:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Only reference their names, never their values.

## Database rules

- Do not run database migrations without explicit approval.
- Do not run production migrations from a normal development task.
- After an approved Prisma schema change, generate the Prisma client.
- Preserve existing user data and backward compatibility whenever possible.
- Explain whether a proposed schema change requires migration or data backfill.

Approved development commands for Prisma work:

```bash
npm run prisma:generate
npm run prisma:migrate