# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are job seekers who want practical, job-specific help improving applications before they submit. They compare a resume against a target job description, identify gaps, improve resume bullets, and later may use a supervised application copilot flow.

## Product Purpose

AI Resume Match Analyzer is a full-stack web app that compares a resume with a job description and returns a rubric-based match score, missing keywords, skill gaps, resume bullet suggestions, and an action plan.

The longer-term product direction is AI Job Application Copilot: a supervised assistant that helps users tailor application materials, review application answers, track applications, and eventually use a Chrome Extension to assist with form filling without automatically submitting applications.

Success means users receive grounded, job-specific advice that helps them decide what to improve, what resume content to tailor, and how to prepare an application without fabricating facts.

## Positioning

The product emphasizes grounded, factual job-application assistance rather than generic AI career advice or unsupervised auto-apply automation. Resume analysis uses a fixed rubric so the final match score is more consistent and explainable.

The long-term copilot direction is explicitly supervised: it may suggest or fill safe fields after review, but it must not submit applications or invent user history.

## Operating Context

Current workflow:

1. User submits resume content and a target job description.
2. The app validates the request.
3. OpenAI generates rubric scores and recommendations.
4. The server calculates the final match score.
5. The analysis is saved for the current user.
6. The user reviews saved analyses through history pages.

Planned workflow:

1. User maintains a Master Profile and Master Resume.
2. User analyzes or captures a job posting.
3. The app generates a tailored resume grounded in the Master Resume.
4. The user reviews and edits outputs before using them.
5. A future Chrome Extension may assist with supported ATS forms, always with preview and user confirmation.

## Capabilities and Constraints

Current capabilities:

- Resume and job description comparison.
- Rubric-based match score out of 100.
- Score breakdown across skills, experience, projects, and keyword coverage.
- Missing keyword detection.
- Skill gap analysis.
- Resume bullet improvement suggestions.
- Action plan for improving an application.
- Saved analysis history.
- Clerk authentication for user-specific history.
- PostgreSQL persistence with Prisma.
- PDF resume upload with client-side extraction and Phase 0 validation.

Technical stack:

- Next.js App Router.
- React and TypeScript.
- Tailwind CSS.
- OpenAI Responses API.
- Zod validation.
- Prisma and PostgreSQL.
- Clerk authentication.
- Vercel deployment.

Durable constraints:

- Do not invent employers, job titles, education, projects, skills, achievements, dates, or metrics.
- Keep AI outputs grounded in the supplied resume, Master Resume, user-confirmed answers, and job description.
- Do not change the scoring rubric or stored analysis format without explicit review.
- Do not change authentication, protected-route behavior, Prisma schema, or migrations as a side effect of UI work.
- User-specific data access must remain scoped by user identity.

Future copilot constraints:

- Never automatically click final application submit.
- Do not bypass CAPTCHA, login verification, or hiring-site safety controls.
- Autofill must show a preview before applying answers.
- Sensitive questions require confirmation.
- Every reusable answer must come from explicit user input or confirmation.
- Users must be able to view, edit, disable, or delete saved answers.

Open decisions:

- Exact Phase 1 Master Profile field list and confirmation policies.
- Whether rubric sub-scores should be saved in history.
- Exact extension authentication design.

## Brand Commitments

Existing product name: AI Resume Match Analyzer.

Long-term product direction name: AI Job Application Copilot.

Voice should stay practical, trustworthy, and job-seeker focused. The product should avoid exaggerated claims, fabricated success metrics, and any framing that implies fully automated job application submission.

## Evidence on Hand

- `README.md`: current product summary, feature list, tech stack, deployment notes, and privacy note.
- `AGENTS.md`: engineering, security, database, and resume-integrity rules.
- `AI_Job_Application_Extension_Roadmap.md`: long-term supervised copilot roadmap and product principles.
- Existing source files under `app/`, `components/`, `lib/`, and `prisma/`.

No real testimonials, user studies, benchmark claims, or enterprise/customer proof are currently established. Future UI work must not fabricate them.

## Product Principles

1. Ground every resume and application recommendation in user-provided facts.
2. Keep users in control before anything is saved, reused, filled, or submitted.
3. Make AI scoring and suggestions explainable enough for job seekers to act on.
4. Treat sensitive application answers as high-trust data that require clear confirmation and editability.
5. Extend the product in phases, adding only the data models and workflows needed for the current phase.

## Accessibility & Inclusion

The product is a web application with form-heavy workflows and should support keyboard access, readable labels, clear error states, sufficient contrast, and responsive layouts for job seekers using desktop or mobile browsers.
