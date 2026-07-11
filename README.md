# AI Resume Match Analyzer

AI Resume Match Analyzer is a full stack web app that compares a resume against a job description and returns a rubric based match score, missing keywords, skill gaps, resume bullet suggestions, and an action plan.

Live demo: https://test-ai-resume.vercel.app

## Overview

This project is designed for job seekers who want practical, job specific resume feedback instead of generic AI advice. Users can paste a resume and a target job description, run an AI assisted analysis, save the result, and revisit previous analyses from the history page.

The app uses a fixed scoring rubric so the match score is more consistent and easier to understand. The AI returns rubric category scores and feedback, while the server calculates the final match score.

## Features

- Resume and job description comparison
- Rubric based match score out of 100
- Score breakdown across skills, experience, projects, and keyword coverage
- Missing keyword detection
- Skill gap analysis
- Resume bullet improvement suggestions
- Action plan for improving the application
- Saved analysis history
- Detail page for viewing a full saved analysis
- Clerk authentication for user specific history
- PostgreSQL persistence with Prisma
- Deployed on Vercel

## Scoring Rubric

The final match score is calculated from four rubric categories:

| Category | Max Points |
| --- | ---: |
| Skills match | 40 |
| Experience relevance | 25 |
| Project relevance | 20 |
| Keyword coverage | 15 |
| Total | 100 |

The model returns the four category scores, and the backend sums them to produce the final match score.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- OpenAI Responses API
- Zod
- Prisma
- PostgreSQL
- Clerk authentication
- Vercel deployment

## Project Structure

```txt
app/
  api/analyze/        Resume analysis API route
  analyze/            Resume analysis page
  history/            Saved analysis history
  history/[id]/       Full saved analysis detail page
components/           Shared UI components
lib/                  OpenAI, Prisma, auth, and validation helpers
prisma/               Prisma schema and migrations
```

## Local Development

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Start the development server:

```bash
npm run dev
```

Open the app at:

```txt
http://localhost:3000
```

If port 3000 is already in use, Next.js may start on another port such as `http://localhost:3001`.

## Deployment

This app is deployed with Vercel.

Vercel build command (this generates Prisma Client automatically):

```bash
npm run build
```

Required Vercel environment variables:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Before production deployment, run:

```bash
npx prisma migrate deploy
```

Do not run database migrations inside every Vercel build.

## Privacy Note

This app stores resume text, job descriptions, and generated analysis results so users can revisit their history. Do not upload sensitive personal information unless you are comfortable storing it in the configured database.

## Future Improvements

- Add rate limiting for public usage
- Add a privacy policy page
- Improve resume rewrite output with before and after examples
- Save rubric sub scores in history records
- Add PDF resume upload
- Add stronger ATS keyword matching
- Add export or copy to clipboard actions

## Status

The current version is an MVP focused on resume job matching, stable scoring, saved history, and public deployment readiness.
