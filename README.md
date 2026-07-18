# Trapwise

**See the trap. Learn the pattern. Beat the test.**

Trapwise is an adaptive SAT-style educational web application for students who want to understand why they miss questions, not just whether an answer was right or wrong.

## Project Overview

Trapwise helps middle-school and high-school students practice SAT-style Math and Reading and Writing questions with a focus on mistake patterns. The first version uses local sample data and browser state only. AI-powered mistake analysis is planned for a later version.

## Problem

Many practice tools show a score and a written explanation, but students often keep repeating the same hidden errors:

- Misreading the question
- Solving for the wrong value
- Choosing a tempting distractor
- Using the wrong formula
- Making an arithmetic mistake
- Selecting an answer without enough textual evidence

Trapwise is designed to make those patterns visible so students can practice against the habits that actually cost points.

## Mistake Twin

The planned Mistake Twin is a profile of the mistakes a student commonly makes. As students answer diagnostic questions, Trapwise will connect missed answers to categories such as `misread_question`, `wrong_operation`, `solved_wrong_value`, and `weak_text_evidence`.

Current version:

- Includes typed mistake categories
- Includes 25 original Systems of Nonlinear Equations questions with trap explanations
- Runs a five-question fixed diagnostic followed by up to ten local adaptive questions
- Tracks confidence, mistake categories, skill performance, and a local topic-mastery estimate
- Produces a Mistake Twin summary and question-by-question review

Planned version:

- Extend the adaptive question bank to more SAT-style topics
- Use OpenAI models for personalized analysis and follow-up questions

## Planned Core Features

- Adaptive diagnostic quiz for Systems of Nonlinear Equations
- Question explanations that identify the trap behind each distractor
- Mistake Twin profile based on repeated error patterns
- Focused practice by weakness, skill, and mistake category
- Local diagnostic-session tracking in browser storage
- Later OpenAI-powered feedback and adaptive question generation

## Current Development Status

This is a local-first Build Week prototype. It has a reliable guest/demo path; Supabase cloud persistence is optional, and no OpenAI API calls are currently made.

Implemented:

- Next.js App Router project scaffold
- Trapwise landing page
- Five fixed diagnostic questions plus adaptive follow-up selection to a maximum of 15 questions
- Confidence capture, local mastery estimate, skill and mistake tracking
- Results report with review, Mistake Twin summary, and recommended practice skill
- Practice page placeholder
- Reusable React components
- TypeScript question and mistake types
- Twenty-five original SAT-style Systems of Nonlinear Equations questions

Known limitations:

- Supabase sign-in screens are implemented, but cloud profile persistence, verified XP writes, and live leaderboards require a configured project and secure server-side RPCs.
- AI analysis, GPT-5.6 follow-ups, and AI trap evaluation are not implemented. The demo labels its current follow-up and Trap Forge evaluation as local rule-based logic.
- The public leaderboard uses clearly labeled fictional demo rows until privacy-safe cloud ranking is configured.

## Technology Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Local TypeScript sample data
- Browser `localStorage` helper for future early progress tracking
- Planned Vercel deployment
- Planned GitHub version control workflow

## Local Installation

Install dependencies:

```bash
npm install
```

## Development Server

Run the local development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build

Create a production build:

```bash
npm run build
```

## Planned OpenAI Integration

Trapwise does not call the OpenAI API yet. A later version is planned to use GPT-5.6 for:

- Explaining why an incorrect answer was tempting
- Summarizing a student's Mistake Twin
- Generating personalized follow-up questions
- Recommending practice based on repeated patterns

No API keys are committed to the repository. The optional server route only calls OpenAI after a learner explicitly requests deeper analysis and the feature is enabled.

## Trapwise Free Tier and optional AI

**Trapwise’s core educational experience does not require an OpenAI API key.** Guests can use adaptive diagnostics, local Mistake Twin feedback, verified follow-ups, daily practice, mastery and streak tracking, visual questions, Trap Forge, XP, achievements, progress history, and the fictional demo leaderboard entirely in browser storage.

AI Enhanced is optional. It is enabled only when all three server-only settings are present: `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ENABLE_AI_FEATURES=true`. AI requests occur only after the learner presses the optional “Analyze deeper” button. Invalid, timed-out, unavailable, or malformed AI results immediately fall back to the verified local explanation; AI never calculates Trapwise mastery or replaces the approved question bank.

## Accounts and Supabase

Trapwise keeps local practice available while signed out. Optional accounts use Supabase Auth and the official Supabase JavaScript client; passwords are handled by Supabase and are never stored in this repository.

1. Create a Supabase project and enable Email/Password authentication.
2. In Supabase Authentication URL Configuration, add `http://localhost:3000/login` and `http://localhost:3000/reset-password` for local development.
3. Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=leave_unset_unless_you_add_a_secure_server-only_operation
```

4. Run [`supabase/migrations/20260718_trapwise_platform.sql`](supabase/migrations/20260718_trapwise_platform.sql) in the Supabase SQL editor.

The migration creates profiles, progress sessions, skill progress, mistake patterns, achievements, daily activity, and private leaderboard groups. It enables Row Level Security on every learner-data table. Users can only access their own rows; public leaderboard data must come from a narrowly scoped server-side view or RPC that returns opted-in display data only.

## Current platform status

- Complete locally: account UI, email/password and reset flows, protected profile/settings views, local-first pending-sync queue, visual questions, daily practice, diagnostics, XP curve, 22 achievement definitions, leaderboards and challenge-mode discovery screens.
- Requires Supabase setup before it becomes cloud-backed: profile persistence, server-verified XP awards, achievement writes, public leaderboard query/RPC, group creation/join, and full local-to-cloud import confirmation.

The queue uses stable client session IDs and a unique `(user_id, client_session_id)` database constraint, so refreshes do not duplicate uploaded sessions. XP must be computed and awarded through a server-side RPC/Edge Function after validating a completed session; the client never submits a total XP value.

## Three-minute demo flow

1. Open Trapwise and either continue as a guest or use the optional sign-in flow.
2. Use **Start Diagnostic** and answer the adaptive questions.
3. On Results, show the local Mistake Twin summary and question review.
4. Select **Try Personalized Follow-Up** for a deterministic verified question matching the “solved wrong value” pattern.
5. Complete **Trap Forge** to identify the distractor pattern and award local demo XP.
6. Open Progress and Leaderboard. For a fast walkthrough, choose **Load Fictional Demo Data** on the home page; it creates only clearly labeled fictional browser data. **Reset Demo Data** removes it.

## Deployment

1. Push the repository to a Git provider and import it into Vercel.
2. Set the public Supabase values in Vercel only if using account features.
3. Add the deployed `/login` and `/reset-password` URLs to Supabase Authentication URL Configuration.
4. Run `npm run lint` and `npm run build` before deployment.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` unset unless you add a server-only RPC/Edge Function; never expose it to the browser.

Public demo: _Coming soon_ · Demo video: _Coming soon_

## How Codex Is Being Used

Codex is being used as a development partner to:

- Inspect and explain the existing project
- Create beginner-friendly project structure
- Draft TypeScript types and sample data
- Build page shells and reusable components
- Keep unfinished features clearly labeled as planned
- Check build and lint status during development

## Project Structure

```text
src/
├── app/
│   ├── diagnostic/
│   │   └── page.tsx
│   ├── practice/
│   │   └── page.tsx
│   ├── results/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AnswerChoice.tsx
│   ├── Header.tsx
│   ├── MistakeTwinCard.tsx
│   ├── ProgressBar.tsx
│   ├── QuestionCard.tsx
│   └── SubjectCard.tsx
├── data/
│   └── sampleQuestions.ts
├── lib/
│   └── storage.ts
└── types/
    ├── mistake.ts
    └── question.ts
```

The project uses `src/app` because Next.js supports `src` as an optional application source folder. The TypeScript `@/*` path alias points to `src/*`.

## Build Week Education Track

Trapwise is being built for the OpenAI Build Week Education track. The prototype explores how AI can help students learn from mistake patterns while keeping the first implementation simple, local, and easy to understand.

## Original Question Policy

All Trapwise practice questions should be original. Questions must not be copied from official SAT exams, College Board materials, paid preparation books, paid question banks, or other commercial preparation materials.

## Visual question policy

Trapwise supports reviewed, data-defined graphs, diagrams, tables, charts, and local image assets. Student-facing diagnostic and daily practice only select questions marked `approved`; unsafe raw SVG or HTML is never rendered. AI image ideas stay as review specifications until a human approves a local asset. See [`docs/visual-image-review.md`](docs/visual-image-review.md).

## Independent Project Disclaimer

Trapwise is an independent SAT-style educational project. It is not affiliated with, sponsored by, reviewed by, or endorsed by the College Board.

## Demo and Deployment Links

- Demo video: _Coming soon_
- Live deployment: _Coming soon_
- GitHub repository: _Coming soon_
